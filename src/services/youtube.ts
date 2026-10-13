import type { Track } from "../data";

const API_KEY = (import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined)?.trim() ?? "";
const CACHE_KEY = "spotify-demo-youtube-ids";

export type YTPlayer = {
  loadVideoById(videoId: string): void;
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
};

type YTNamespace = {
  Player: new (el: HTMLElement, options: Record<string, unknown>) => YTPlayer;
};

type YouTubeSearchItem = {
  id?: { videoId?: string };
  snippet?: { title?: string; channelTitle?: string; thumbnails?: Record<string, { url: string }> };
};

export const hasYouTubeKey = () => API_KEY.length > 0;

function decodeHtml(text: string) {
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

// YouTube ids are strings but Track.id is a number, so derive a stable negative id.
function hashId(videoId: string) {
  let hash = 0;
  for (let i = 0; i < videoId.length; i += 1) hash = (hash * 31 + videoId.charCodeAt(i)) | 0;
  return -Math.abs(hash) - 1;
}

function readCache(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}") as Record<string, string>; } catch { return {}; }
}

function writeCache(cache: Record<string, string>) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* storage may be unavailable */ }
}

const searchCache = new Map<string, Track[]>();

async function rawSearch(query: string, maxResults: number): Promise<YouTubeSearchItem[]> {
  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    videoCategoryId: "10", // Music
    videoEmbeddable: "true",
    maxResults: String(maxResults),
    q: query,
    key: API_KEY,
  });
  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!response.ok) throw new Error(`YouTube API ${response.status}`);
  const data = (await response.json()) as { items?: YouTubeSearchItem[] };
  return data.items ?? [];
}

function toTrack(item: YouTubeSearchItem): Track | null {
  const videoId = item.id?.videoId;
  const snippet = item.snippet;
  if (!videoId || !snippet) return null;
  const thumbs = snippet.thumbnails ?? {};
  return {
    id: hashId(videoId),
    videoId,
    name: decodeHtml(snippet.title ?? "Unknown title"),
    artist: decodeHtml((snippet.channelTitle ?? "YouTube").replace(/ - Topic$/, "")),
    image: (thumbs.high ?? thumbs.medium ?? thumbs.default)?.url ?? "",
  };
}

export async function searchYouTube(query: string, maxResults = 12): Promise<Track[]> {
  const key = `${query}|${maxResults}`;
  const cached = searchCache.get(key);
  if (cached) return cached;
  const items = await rawSearch(query, maxResults);
  const tracks = items.map(toTrack).filter((track): track is Track => track !== null);
  searchCache.set(key, tracks);
  return tracks;
}

// Finds a playable video for a track that came from another catalog (Deezer). Cached to save API quota.
export async function findVideoId(track: Pick<Track, "name" | "artist">): Promise<string | null> {
  const cacheKey = `${track.artist} - ${track.name}`.toLowerCase();
  const cache = readCache();
  if (cache[cacheKey]) return cache[cacheKey];
  const items = await rawSearch(`${track.artist} ${track.name} audio`, 1);
  const videoId = items[0]?.id?.videoId ?? null;
  if (videoId) writeCache({ ...cache, [cacheKey]: videoId });
  return videoId;
}

let apiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeApi(): Promise<YTNamespace> {
  const win = window as unknown as { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void };
  if (win.YT?.Player) return Promise.resolve(win.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    win.onYouTubeIframeAPIReady = () => (win.YT ? resolve(win.YT) : reject(new Error("YouTube API missing")));
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => { apiPromise = null; reject(new Error("Could not load the YouTube player")); };
    document.head.appendChild(script);
  });
  return apiPromise;
}

export async function createYouTubePlayer(
  container: HTMLElement,
  handlers: { onState: (state: number) => void; onError: (code: number) => void },
): Promise<YTPlayer> {
  const YT = await loadYouTubeApi();
  const mount = document.createElement("div");
  container.appendChild(mount);
  return new Promise<YTPlayer>((resolve) => {
    const player: YTPlayer = new YT.Player(mount, {
      width: 200,
      height: 200,
      playerVars: { playsinline: 1, rel: 0, modestbranding: 1, iv_load_policy: 3 },
      events: {
        onReady: () => resolve(player),
        onStateChange: (event: { data: number }) => handlers.onState(event.data),
        onError: (event: { data: number }) => handlers.onError(event.data),
      },
    });
  });
}
