import type { Track } from "../data";

type DeezerTrack = {
  id: number;
  title: string;
  duration: number;
  explicit_lyrics?: boolean;
  preview?: string;
  artist?: { id: number; name: string };
  album?: { id: number; cover_big?: string; cover_medium?: string };
};

type DeezerResponse<T> = {
  data?: T[];
  error?: { message: string };
};

let requestNumber = 0;

// Deezer exposes JSONP for browser-side catalog requests without an API key.
function jsonp<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const callback = `__music_preview_${Date.now()}_${++requestNumber}`;
    const script = document.createElement("script");
    const global = window as unknown as Record<string, unknown>;
    let finished = false;

    const cleanup = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      script.remove();
      delete global[callback];
    };

    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("The music catalog took too long to respond."));
    }, 10000);

    global[callback] = (result: T) => {
      cleanup();
      resolve(result);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("Could not reach the music catalog."));
    };
    script.src = `${url}${url.includes("?") ? "&" : "?"}output=jsonp&callback=${callback}`;
    document.body.appendChild(script);
  });
}

function mapTrack(track: DeezerTrack, fallback?: Partial<Track>): Track {
  return {
    id: track.id,
    name: track.title,
    artist: track.artist?.name || fallback?.artist || "Unknown artist",
    artistId: track.artist?.id || fallback?.artistId,
    albumId: track.album?.id || fallback?.albumId,
    image: track.album?.cover_big || track.album?.cover_medium || fallback?.image || "",
    duration: track.duration,
    explicit: track.explicit_lyrics,
    previewUrl: track.preview || fallback?.previewUrl,
  };
}

async function getTracks(url: string, fallback?: Partial<Track>): Promise<Track[]> {
  const response = await jsonp<DeezerResponse<DeezerTrack>>(url);
  if (response.error) throw new Error(response.error.message);
  return (response.data || []).map((track) => mapTrack(track, fallback));
}

export function getAlbumTracks(albumId: number, fallback: Partial<Track>) {
  return getTracks(`https://api.deezer.com/album/${albumId}/tracks?limit=50`, fallback);
}

export function getArtistTop(artistId: number, fallback: Partial<Track>) {
  return getTracks(`https://api.deezer.com/artist/${artistId}/top?limit=10`, fallback);
}

export function searchMusic(query: string) {
  return getTracks(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=18`);
}

export async function getPreview(trackId: number): Promise<string> {
  const response = await jsonp<DeezerTrack & { error?: { message: string } }>(
    `https://api.deezer.com/track/${trackId}`,
  );
  if (response.error || !response.preview) {
    throw new Error(response.error?.message || "No preview is available for this song.");
  }
  return response.preview;
}