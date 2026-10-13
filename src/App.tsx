import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  Globe2,
  Heart,
  House,
  Library,
  ListMusic,
  Maximize2,
  Mic2,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  Plus,
  Repeat2,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  browseCategories,
  editorials,
  podcastPicks,
  popularAlbums,
  popularArtists,
  trendingTracks,
  type Album,
  type Artist,
  type Editorial,
  type Playlist,
  type Track,
} from "./data";
import { getAlbumTracks, getArtistTop, getPreview, searchMusic } from "./services/deezer";
import { createYouTubePlayer, findVideoId, hasYouTubeKey, searchYouTube, type YTPlayer } from "./services/youtube";

type Section = "trending" | "artists" | "albums" | "editorials";
type View =
  | { type: "home" }
  | { type: "search" }
  | { type: "all"; section: Section }
  | { type: "category"; name: string }
  | { type: "track"; item: Track }
  | { type: "artist"; item: Artist }
  | { type: "album"; item: Album }
  | { type: "editorial"; item: Editorial }
  | { type: "playlist"; id: string }
  | { type: "liked" };

const sectionNames: Record<Section, string> = {
  trending: "Trending songs",
  artists: "Popular artists",
  albums: "Popular albums and singles",
  editorials: "Popular playlists",
};

function SpotifyMark({ size = 32, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 .48C5.64.48.48 5.64.48 12S5.64 23.52 12 23.52 23.52 18.36 23.52 12 18.36.48 12 .48Zm5.29 16.65a.73.73 0 0 1-1 .24c-2.72-1.66-6.14-2.04-10.17-1.12a.73.73 0 0 1-.33-1.42c4.41-1.01 8.2-.57 11.26 1.3a.73.73 0 0 1 .24 1Zm1.4-3.1a.92.92 0 0 1-1.27.3c-3.11-1.91-7.85-2.46-11.53-1.35a.92.92 0 0 1-.53-1.76c4.2-1.27 9.43-.65 13.03 1.56a.92.92 0 0 1 .3 1.26Zm.12-3.23c-3.73-2.22-9.88-2.43-13.44-1.35a1.1 1.1 0 1 1-.64-2.11c4.09-1.24 10.9-1 15.2 1.55a1.1 1.1 0 1 1-1.12 1.9Z" />
    </svg>
  );
}

function formatTime(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds)) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

function readStoredList<T>(key: string): T[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function MediaCard({
  title,
  subtitle,
  image,
  circular = false,
  onOpen,
  onPlay,
}: {
  title: string;
  subtitle: string;
  image: string;
  circular?: boolean;
  onOpen: () => void;
  onPlay: () => void;
}) {
  return (
    <div
      className="media-card"
      role="button"
      tabIndex={0}
      aria-label={`Open ${title}`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className={`media-art ${circular ? "media-art-round" : ""}`}>
        <img src={image} alt="" loading="lazy" />
        <button
          className="card-play"
          type="button"
          aria-label={`Play ${title}`}
          onClick={(event) => {
            event.stopPropagation();
            onPlay();
          }}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Play size={22} fill="currentColor" strokeWidth={1.8} />
        </button>
      </div>
      <div className="media-text">
        <div className="media-title" title={title}>{title}</div>
        <div className="media-subtitle" title={subtitle}>{subtitle}</div>
      </div>
    </div>
  );
}

function MediaSection({ title, children, onShowAll }: { title: string; children: ReactNode; onShowAll?: () => void }) {
  return (
    <section className="media-section" aria-label={title}>
      <div className="section-heading">
        <h2>{title}</h2>
        {onShowAll && <button type="button" className="show-all" onClick={onShowAll}>Show all</button>}
      </div>
      <div className="media-row">{children}</div>
    </section>
  );
}

function TrackRows({
  tracks,
  onPlay,
  onAdd,
  onRemove,
  activeId,
  isPlaying,
  showCover = true,
  showHeader = false,
}: {
  tracks: Track[];
  onPlay: (track: Track, queue: Track[]) => void;
  onAdd: (track: Track) => void;
  onRemove?: (track: Track) => void;
  activeId?: number;
  isPlaying: boolean;
  showCover?: boolean;
  showHeader?: boolean;
}) {
  return (
    <div className="track-list">
      {showHeader && <div className="track-list-header"><span>#</span><span>Title</span><span /><Clock3 size={17} /></div>}
      {tracks.map((track, index) => (
        <div
          className={`track-row ${activeId === track.id ? "track-row-active" : ""}`}
          key={`${track.id}-${index}`}
          role="button"
          tabIndex={0}
          aria-label={`Play ${track.name} by ${track.artist}`}
          onClick={() => onPlay(track, tracks)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onPlay(track, tracks);
            }
          }}
        >
          <div className="track-number">
            <span>{activeId === track.id && isPlaying ? <span className="playing-bars"><i /><i /><i /></span> : index + 1}</span>
            <Play className="track-hover-play" size={15} fill="currentColor" />
          </div>
          <div className="track-main-info">
            {showCover && <img src={track.image} alt="" loading="lazy" />}
            <div className="track-lines">
              <div className="track-name">{track.name}</div>
              <div className="track-artist">
                {track.explicit && <span className="explicit-mark" aria-label="Explicit">E</span>}
                {track.artist}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="track-add"
            title={onRemove ? "Remove from playlist" : "Add to playlist"}
            aria-label={onRemove ? `Remove ${track.name}` : `Add ${track.name} to playlist`}
            onClick={(event) => {
              event.stopPropagation();
              if (onRemove) onRemove(track);
              else onAdd(track);
            }}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {onRemove ? <X size={17} /> : <Plus size={18} />}
          </button>
          <span className="track-length">{formatTime(track.duration)}</span>
        </div>
      ))}
    </div>
  );
}

const footerGroups = [
  {
    title: "Company",
    links: [
      ["About", "https://www.spotify.com/about-us/"],
      ["Jobs", "https://www.lifeatspotify.com/"],
      ["For the Record", "https://newsroom.spotify.com/"],
    ],
  },
  {
    title: "Communities",
    links: [
      ["For Artists", "https://artists.spotify.com/"],
      ["Developers", "https://developer.spotify.com/"],
      ["Advertising", "https://ads.spotify.com/"],
      ["Investors", "https://investors.spotify.com/"],
      ["Vendors", "https://spotifyforvendors.com/"],
    ],
  },
  {
    title: "Useful links",
    links: [
      ["Support", "https://support.spotify.com/"],
      ["Free Mobile App", "https://www.spotify.com/download/"],
    ],
  },
  {
    title: "Spotify Plans",
    links: [
      ["Premium Individual", "https://www.spotify.com/premium/"],
      ["Premium Duo", "https://www.spotify.com/duo/"],
      ["Premium Family", "https://www.spotify.com/family/"],
      ["Premium Student", "https://www.spotify.com/student/"],
      ["Spotify Free", "https://www.spotify.com/free/"],
    ],
  },
];

function MainFooter() {
  return (
    <footer className="main-footer">
      <div className="footer-top">
        <div className="footer-columns">
          {footerGroups.map((group) => (
            <div className="footer-column" key={group.title}>
              <h3>{group.title}</h3>
              {group.links.map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer">{label}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="social-links">
          <a href="https://www.instagram.com/spotify/" target="_blank" rel="noreferrer" aria-label="Spotify on Instagram"><Camera size={18} /></a>
          <a href="https://x.com/spotify" target="_blank" rel="noreferrer" aria-label="Spotify on X"><span className="x-social">X</span></a>
          <a href="https://www.facebook.com/Spotify" target="_blank" rel="noreferrer" aria-label="Spotify on Facebook"><span className="facebook-social">f</span></a>
        </div>
      </div>
      <div className="footer-copyright">(c) 2026 Spotify AB</div>
    </footer>
  );
}

export default function App() {
  const [view, setView] = useState<View>({ type: "home" });
  const [backStack, setBackStack] = useState<View[]>([]);
  const [forwardStack, setForwardStack] = useState<View[]>([]);
  const [query, setQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState<Track[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [detailTracks, setDetailTracks] = useState<Track[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>(() => readStoredList<Playlist>("spotify-demo-playlists"));
  const [likedTracks, setLikedTracks] = useState<Track[]>(() => readStoredList<Track>("spotify-demo-liked"));
  const [libraryCollapsed, setLibraryCollapsed] = useState(false);
  const [mobileLibraryOpen, setMobileLibraryOpen] = useState(false);
  const [authModal, setAuthModal] = useState<"signup" | "login" | null>(null);
  const [trackToAdd, setTrackToAdd] = useState<Track | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [playlistSearch, setPlaylistSearch] = useState("");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const [following, setFollowing] = useState<number[]>([]);
  const [toast, setToast] = useState("");
  const [libraryFilter, setLibraryFilter] = useState<"All" | "Playlists" | "Podcasts">("All");
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(30);
  const [volume, setVolume] = useState(75);
  const [lastVolume, setLastVolume] = useState(75);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playRequest = useRef(0);
  const [playerMode, setPlayerMode] = useState<"preview" | "youtube">("preview");
  const ytRef = useRef<YTPlayer | null>(null);
  const ytPromise = useRef<Promise<YTPlayer> | null>(null);
  const ytBoxRef = useRef<HTMLDivElement>(null);
  const usingYt = useRef(false);
  const ytStateHandler = useRef<(state: number) => void>(() => {});
  const ytErrorHandler = useRef<(code: number) => void>(() => {});

  useEffect(() => { localStorage.setItem("spotify-demo-playlists", JSON.stringify(playlists)); }, [playlists]);
  useEffect(() => { localStorage.setItem("spotify-demo-liked", JSON.stringify(likedTracks)); }, [likedTracks]);
  useEffect(() => {
    if (!isPlaying || playerMode !== "youtube") return;
    const timer = window.setInterval(() => {
      const player = ytRef.current;
      if (!player || !usingYt.current) return;
      setProgress(player.getCurrentTime() || 0);
      const duration = player.getDuration();
      if (duration > 0) setPreviewDuration(duration);
    }, 500);
    return () => window.clearInterval(timer);
  }, [isPlaying, playerMode]);

  useEffect(() => {
    document.title = view.type === "home"
      ? "Spotify - Web Player: Music for everyone"
      : view.type === "search"
        ? "Search | Spotify"
        : view.type === "artist"
          ? `${view.item.name} | Spotify`
          : view.type === "album"
            ? `${view.item.title} | Spotify`
            : view.type === "track"
              ? `${view.item.name} | Spotify`
              : "Spotify - Web Player";
  }, [view]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (view.type !== "search" || query.trim().length < 2) {
      setRemoteResults([]);
      setSearchLoading(false);
      return;
    }
    let active = true;
    setSearchLoading(true);
    const timer = window.setTimeout(() => {
      Promise.all([
        searchMusic(query.trim()).catch(() => [] as Track[]),
        hasYouTubeKey() ? searchYouTube(query.trim()).catch(() => [] as Track[]) : Promise.resolve([] as Track[]),
      ]).then(([deezerTracks, youtubeTracks]) => [...youtubeTracks, ...deezerTracks])
        .then((results) => { if (active) setRemoteResults(results); })
        .catch(() => { if (active) setRemoteResults([]); })
        .finally(() => { if (active) setSearchLoading(false); });
    }, 350);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query, view.type]);

  useEffect(() => {
    let active = true;
    if (view.type === "artist") {
      setDetailLoading(true);
      setDetailTracks([]);
      getArtistTop(view.item.id, { artist: view.item.name, artistId: view.item.id, image: view.item.image })
        .then((tracks) => { if (active) setDetailTracks(tracks); })
        .catch(() => { if (active) setDetailTracks(trendingTracks.filter((track) => track.artist.includes(view.item.name))); })
        .finally(() => { if (active) setDetailLoading(false); });
    } else if (view.type === "album" || view.type === "track") {
      const albumId = view.type === "album" ? view.item.id : view.item.albumId;
      const fallback = view.type === "album"
        ? { image: view.item.image, artist: view.item.artist, albumId: view.item.id, artistId: view.item.artistId }
        : view.item;
      setDetailLoading(true);
      setDetailTracks([]);
      if (albumId) {
        getAlbumTracks(albumId, fallback)
          .then((tracks) => { if (active) setDetailTracks(tracks); })
          .catch(() => { if (active) setDetailTracks(view.type === "track" ? [view.item] : []); })
          .finally(() => { if (active) setDetailLoading(false); });
      } else {
        setDetailTracks(view.type === "track" ? [view.item] : []);
        setDetailLoading(false);
      }
    } else if (view.type === "editorial") {
      setDetailTracks([...trendingTracks.slice(0, 7), ...trendingTracks.slice(9)]);
      setDetailLoading(false);
    }
    return () => { active = false; };
  }, [view]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAuthModal(null);
        setTrackToAdd(null);
        setRenameId(null);
        setLanguageOpen(false);
        setMobileLibraryOpen(false);
      }
      if (event.code === "Space" && currentTrack && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement) && !(event.target instanceof HTMLButtonElement)) {
        event.preventDefault();
        togglePlayback();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function navigate(next: View) {
    if (next.type === view.type && next.type === "home") {
      mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setBackStack((stack) => [...stack, view]);
    setForwardStack([]);
    setView(next);
    setMobileLibraryOpen(false);
    mainRef.current?.scrollTo(0, 0);
  }

  function goBack() {
    if (!backStack.length) return;
    const previous = backStack[backStack.length - 1];
    setBackStack((stack) => stack.slice(0, -1));
    setForwardStack((stack) => [view, ...stack]);
    setView(previous);
    mainRef.current?.scrollTo(0, 0);
  }

  function goForward() {
    if (!forwardStack.length) return;
    const next = forwardStack[0];
    setForwardStack((stack) => stack.slice(1));
    setBackStack((stack) => [...stack, view]);
    setView(next);
    mainRef.current?.scrollTo(0, 0);
  }

  function openSearch() {
    if (view.type !== "search") navigate({ type: "search" });
    window.setTimeout(() => searchRef.current?.focus(), 0);
  }

  function createPlaylist(initialTrack?: Track) {
    const id = `playlist-${Date.now()}`;
    const next: Playlist = { id, name: `My Playlist #${playlists.length + 1}`, tracks: initialTrack ? [initialTrack] : [] };
    setPlaylists((items) => [next, ...items]);
    setTrackToAdd(null);
    setPlaylistSearch("");
    navigate({ type: "playlist", id });
    setToast("Playlist created");
  }

  function addToPlaylist(id: string, track: Track) {
    let alreadyAdded = false;
    setPlaylists((items) => items.map((playlist) => {
      if (playlist.id !== id) return playlist;
      if (playlist.tracks.some((song) => song.id === track.id)) {
        alreadyAdded = true;
        return playlist;
      }
      return { ...playlist, tracks: [...playlist.tracks, track] };
    }));
    setTrackToAdd(null);
    setToast(alreadyAdded ? "This song is already in your playlist" : "Added to playlist");
  }

  function removeFromPlaylist(id: string, trackId: number) {
    setPlaylists((items) => items.map((playlist) => playlist.id === id
      ? { ...playlist, tracks: playlist.tracks.filter((track) => track.id !== trackId) }
      : playlist));
    setToast("Removed from playlist");
  }

  function toggleLike(track: Track) {
    const isLiked = likedTracks.some((song) => song.id === track.id);
    setLikedTracks((items) => isLiked ? items.filter((song) => song.id !== track.id) : [track, ...items]);
    setToast(isLiked ? "Removed from Liked Songs" : "Added to Liked Songs");
  }

  function setEngineVolume(value: number) {
    setEngineVolume(value);
    ytRef.current?.setVolume(value);
  }

  function seekTo(seconds: number) {
    if (usingYt.current) ytRef.current?.seekTo(seconds, true);
    else if (audioRef.current) audioRef.current.currentTime = seconds;
  }

  async function ensureYtPlayer(): Promise<YTPlayer> {
    if (ytRef.current) return ytRef.current;
    if (!ytPromise.current) {
      const box = ytBoxRef.current;
      if (!box) throw new Error("Player container missing");
      ytPromise.current = createYouTubePlayer(box, {
        onState: (state) => ytStateHandler.current(state),
        onError: (code) => ytErrorHandler.current(code),
      }).then((player) => { ytRef.current = player; return player; }).catch((error) => { ytPromise.current = null; throw error; });
    }
    return ytPromise.current;
  }

  function togglePlayback() {
    if (usingYt.current) {
      const player = ytRef.current;
      if (!player || !currentTrack || audioLoading) return;
      if (player.getPlayerState() === 1) player.pauseVideo(); else player.playVideo();
      return;
    }
    const audio = audioRef.current;
    if (!audio || !currentTrack || audioLoading) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => setToast("This preview could not be played."));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }

  async function playTrack(track: Track, playQueue: Track[] = trendingTracks, force = false) {
    if (currentTrack?.id === track.id && !force) { togglePlayback(); return; }
    const request = ++playRequest.current;
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.removeAttribute("src");
    try { ytRef.current?.stopVideo(); } catch { /* player not ready */ }
    usingYt.current = false;
    setPlayerMode("preview");
    setCurrentTrack(track);
    setQueue(playQueue.length ? playQueue : [track]);
    setIsPlaying(false);
    setAudioLoading(true);
    setProgress(0);
    setPreviewDuration(30);
    if (hasYouTubeKey()) {
      try {
        const videoId = track.videoId || (await findVideoId(track));
        if (request !== playRequest.current) return;
        if (videoId) {
          const player = await ensureYtPlayer();
          if (request !== playRequest.current) return;
          usingYt.current = true;
          setPlayerMode("youtube");
          player.setVolume(volume);
          player.loadVideoById(videoId);
          setAudioLoading(false);
          return;
        }
      } catch {
        if (request !== playRequest.current) return;
        usingYt.current = false;
        setPlayerMode("preview");
      }
    }
    try {
      const url = track.previewUrl || (await getPreview(track.id));
      if (request !== playRequest.current) return;
      audio.src = url;
      audio.volume = volume / 100;
      audio.load();
      await audio.play();
      if (request === playRequest.current) setIsPlaying(true);
    } catch {
      if (request === playRequest.current) setToast("A preview is not available for this song right now.");
    } finally {
      if (request === playRequest.current) setAudioLoading(false);
    }
  }

  function playNext() {
    if (!currentTrack || !queue.length) return;
    const index = queue.findIndex((track) => track.id === currentTrack.id);
    const nextIndex = shuffle && queue.length > 1
      ? (index + 1 + Math.floor(Math.random() * (queue.length - 1))) % queue.length
      : (index + 1) % queue.length;
    void playTrack(queue[nextIndex], queue, true);
  }

  function playPrevious() {
    if (!currentTrack || !queue.length) return;
    if (progress > 3) { seekTo(0); return; }
    const index = queue.findIndex((track) => track.id === currentTrack.id);
    void playTrack(queue[(index - 1 + queue.length) % queue.length], queue, true);
  }

  function handleEnded() {
    if (repeat) {
      seekTo(0);
      if (usingYt.current) ytRef.current?.playVideo(); else void audioRef.current?.play();
    } else if (queue.length > 1) playNext();
    else setIsPlaying(false);
  }

  ytStateHandler.current = (state) => {
    if (!usingYt.current) return;
    if (state === 1) {
      setIsPlaying(true);
      setAudioLoading(false);
      const duration = ytRef.current?.getDuration();
      if (duration && duration > 0) setPreviewDuration(duration);
    } else if (state === 2) setIsPlaying(false);
    else if (state === 0) handleEnded();
  };

  ytErrorHandler.current = () => {
    if (!usingYt.current) return;
    setIsPlaying(false);
    setToast("This video can't be played here.");
    if (queue.length > 1) playNext();
  };

  async function playAlbum(album: Album) {
    try {
      const songs = await getAlbumTracks(album.id, { image: album.image, artist: album.artist, albumId: album.id, artistId: album.artistId });
      if (songs.length) void playTrack(songs[0], songs);
      else setToast("No previews are available for this album.");
    } catch { setToast("Could not load this album right now."); }
  }

  async function playArtist(artist: Artist) {
    try {
      const songs = await getArtistTop(artist.id, { image: artist.image, artist: artist.name, artistId: artist.id });
      if (songs.length) void playTrack(songs[0], songs);
      else setToast("No previews are available for this artist.");
    } catch { setToast("Could not load this artist right now."); }
  }

  function playEditorial() { void playTrack(trendingTracks[0], trendingTracks); }

  function renderTrackCard(track: Track) {
    return <MediaCard key={track.id} title={track.name} subtitle={track.artist} image={track.image}
      onOpen={() => navigate({ type: "track", item: track })} onPlay={() => void playTrack(track, trendingTracks)} />;
  }

  function renderArtistCard(artist: Artist) {
    return <MediaCard key={artist.id} title={artist.name} subtitle="Artist" image={artist.image} circular
      onOpen={() => navigate({ type: "artist", item: artist })} onPlay={() => void playArtist(artist)} />;
  }

  function renderAlbumCard(album: Album) {
    return <MediaCard key={album.id} title={album.title} subtitle={album.artist} image={album.image}
      onOpen={() => navigate({ type: "album", item: album })} onPlay={() => void playAlbum(album)} />;
  }

  function renderEditorialCard(editorial: Editorial) {
    return <MediaCard key={editorial.id} title={editorial.title} subtitle={editorial.description} image={editorial.image}
      onOpen={() => navigate({ type: "editorial", item: editorial })} onPlay={playEditorial} />;
  }

  function renderHome() {
    return (
      <div className="home-view view-enter">
        <h1 className="page-title">{greeting()}</h1>
        <div className="quick-grid" aria-label="Quick picks">
          {trendingTracks.slice(0, 6).map((track) => (
            <button className="quick-pick" type="button" key={track.id} onClick={() => void playTrack(track, trendingTracks)} aria-label={`Play ${track.name}`}>
              <img className="quick-cover" src={track.image} alt="" loading="lazy" />
              <span className="quick-title">{track.name}</span>
              <span className="quick-play" aria-hidden="true"><Play size={19} fill="currentColor" /></span>
            </button>
          ))}
        </div>
        <MediaSection title="Trending songs" onShowAll={() => navigate({ type: "all", section: "trending" })}>{trendingTracks.map(renderTrackCard)}</MediaSection>
        <MediaSection title="Popular artists" onShowAll={() => navigate({ type: "all", section: "artists" })}>{popularArtists.map(renderArtistCard)}</MediaSection>
        <MediaSection title="Popular albums and singles" onShowAll={() => navigate({ type: "all", section: "albums" })}>{popularAlbums.map(renderAlbumCard)}</MediaSection>
        <MediaSection title="Popular playlists" onShowAll={() => navigate({ type: "all", section: "editorials" })}>{editorials.map(renderEditorialCard)}</MediaSection>
        <MainFooter />
      </div>
    );
  }

  function renderSearch() {
    const normalized = query.toLowerCase().trim();
    if (!normalized) {
      return (
        <div className="browse-view view-enter">
          <h1 className="browse-heading">Browse all</h1>
          <div className="browse-grid">
            {browseCategories.map((category) => (
              <button className="browse-tile" type="button" key={category.name} style={{ backgroundColor: category.color }} onClick={() => navigate({ type: "category", name: category.name })}>
                <span>{category.name}</span><img src={category.image} alt="" loading="lazy" />
              </button>
            ))}
          </div>
          <MainFooter />
        </div>
      );
    }
    const matchingArtists = popularArtists.filter((artist) => artist.name.toLowerCase().includes(normalized));
    const matchingAlbums = popularAlbums.filter((album) => `${album.title} ${album.artist}`.toLowerCase().includes(normalized));
    const localTracks = trendingTracks.filter((track) => `${track.name} ${track.artist}`.toLowerCase().includes(normalized));
    const results = [...localTracks, ...remoteResults.filter((track) => !localTracks.some((local) => local.id === track.id))];
    const topArtist = matchingArtists[0];
    const topAlbum = matchingAlbums[0];
    const topTrack = results[0];
    return (
      <div className="search-results view-enter">
        {(topArtist || topAlbum || topTrack || searchLoading) && (
          <div className="search-top-grid">
            <section className="top-result-section">
              <h2>Top result</h2>
              {topArtist ? (
                <button className="top-result-card" type="button" onClick={() => navigate({ type: "artist", item: topArtist })}>
                  <img className="top-result-round" src={topArtist.image} alt="" /><strong>{topArtist.name}</strong><span className="result-kind">Artist</span>
                  <span className="top-result-play" onClick={(event) => { event.stopPropagation(); void playArtist(topArtist); }}><Play size={22} fill="currentColor" /></span>
                </button>
              ) : topAlbum ? (
                <button className="top-result-card" type="button" onClick={() => navigate({ type: "album", item: topAlbum })}>
                  <img src={topAlbum.image} alt="" /><strong>{topAlbum.title}</strong><span className="result-kind">Album &bull; {topAlbum.artist}</span>
                  <span className="top-result-play" onClick={(event) => { event.stopPropagation(); void playAlbum(topAlbum); }}><Play size={22} fill="currentColor" /></span>
                </button>
              ) : topTrack ? (
                <button className="top-result-card" type="button" onClick={() => navigate({ type: "track", item: topTrack })}>
                  <img src={topTrack.image} alt="" /><strong>{topTrack.name}</strong><span className="result-kind">Song &bull; {topTrack.artist}</span>
                  <span className="top-result-play" onClick={(event) => { event.stopPropagation(); void playTrack(topTrack, results); }}><Play size={22} fill="currentColor" /></span>
                </button>
              ) : <div className="search-placeholder">Searching the catalog...</div>}
            </section>
            <section className="search-songs-section">
              <h2>Songs</h2>
              {results.length ? (
                <TrackRows tracks={results.slice(0, 4)} onPlay={(track) => void playTrack(track, results)} onAdd={setTrackToAdd} activeId={currentTrack?.id} isPlaying={isPlaying} />
              ) : <div className="search-placeholder">{searchLoading ? "Searching for songs..." : "No songs found yet."}</div>}
            </section>
          </div>
        )}
        {matchingArtists.length > 0 && <MediaSection title="Artists">{matchingArtists.map(renderArtistCard)}</MediaSection>}
        {matchingAlbums.length > 0 && <MediaSection title="Albums">{matchingAlbums.map(renderAlbumCard)}</MediaSection>}
        {results.length > 4 && (
          <section className="search-all-songs"><h2>Songs</h2>
            <TrackRows tracks={results.slice(4, 15)} onPlay={(track) => void playTrack(track, results)} onAdd={setTrackToAdd} activeId={currentTrack?.id} isPlaying={isPlaying} />
          </section>
        )}
        {!searchLoading && !topArtist && !topAlbum && !topTrack && (
          <div className="no-results"><h2>No results found for "{query}"</h2><p>Please make sure your words are spelled correctly, or use different keywords.</p></div>
        )}
      </div>
    );
  }

  function renderAll() {
    if (view.type !== "all") return null;
    const section = view.section;
    return (
      <div className="all-view view-enter">
        <h1>{sectionNames[section]}</h1>
        <div className="all-grid">
          {section === "trending" && trendingTracks.map(renderTrackCard)}
          {section === "artists" && popularArtists.map(renderArtistCard)}
          {section === "albums" && popularAlbums.map(renderAlbumCard)}
          {section === "editorials" && editorials.map(renderEditorialCard)}
        </div>
        <MainFooter />
      </div>
    );
  }

  function renderCategory() {
    if (view.type !== "category") return null;
    const category = browseCategories.find((item) => item.name === view.name);
    const isPodcasts = view.name === "Podcasts";
    return (
      <div className="category-view view-enter">
        <div className="category-banner" style={{ backgroundColor: category?.color || "#333" }}><h1>{view.name}</h1></div>
        <div className="category-content">
          {isPodcasts ? <>
            <MediaSection title="Popular podcasts">
              {podcastPicks.map((podcast) => <MediaCard key={podcast.id} title={podcast.title} subtitle={podcast.publisher} image={podcast.image}
                onOpen={() => window.open(`https://open.spotify.com/show/${podcast.id}`, "_blank", "noopener,noreferrer")}
                onPlay={() => window.open(`https://open.spotify.com/show/${podcast.id}`, "_blank", "noopener,noreferrer")} />)}
            </MediaSection>
            <p className="podcast-note">Open a show on Spotify to listen to full episodes.</p>
          </> : <>
            <MediaSection title={`Popular in ${view.name}`}>{popularAlbums.map(renderAlbumCard)}</MediaSection>
            <MediaSection title="Fresh finds">{trendingTracks.map(renderTrackCard)}</MediaSection>
            <MediaSection title="Made for every moment">{editorials.map(renderEditorialCard)}</MediaSection>
          </>}
          <MainFooter />
        </div>
      </div>
    );
  }

  function renderDetail() {
    if (view.type === "artist") {
      const artist = view.item;
      const isFollowing = following.includes(artist.id);
      const relatedAlbums = popularAlbums.filter((album) => album.artistId === artist.id || album.artist.includes(artist.name));
      return (
        <div className="detail-view view-enter">
          <div className="artist-hero" style={{ backgroundImage: `linear-gradient(0deg, rgba(0,0,0,.73), rgba(0,0,0,.08)), url("${artist.image}")` }}>
            <div className="artist-hero-inner">
              <div className="verified-line"><span className="verified-dot"><Check size={12} strokeWidth={4} /></span> Verified Artist</div>
              <h1>{artist.name}</h1><p>Listen to the songs you love.</p>
            </div>
          </div>
          <div className="detail-body artist-detail-body">
            <div className="detail-actions">
              <button className="large-play" type="button" aria-label={`Play ${artist.name}`} onClick={() => void playArtist(artist)}><Play size={26} fill="currentColor" /></button>
              <button className={`follow-button ${isFollowing ? "following" : ""}`} type="button" onClick={() => setFollowing((items) => isFollowing ? items.filter((id) => id !== artist.id) : [...items, artist.id])}>{isFollowing ? "Following" : "Follow"}</button>
              <button className="plain-icon" type="button" title="More options" onClick={() => setToast("Explore more from this artist below.")}><MoreHorizontal size={28} /></button>
            </div>
            <h2 className="detail-heading">Popular</h2>
            {detailLoading ? <div className="loading-lines">Loading popular songs...</div> : detailTracks.length ? (
              <TrackRows tracks={detailTracks.slice(0, 10)} onPlay={(track) => void playTrack(track, detailTracks)} onAdd={setTrackToAdd} activeId={currentTrack?.id} isPlaying={isPlaying} />
            ) : <p className="muted-copy">Songs are not available right now.</p>}
            {relatedAlbums.length > 0 && <MediaSection title="Popular releases">{relatedAlbums.map(renderAlbumCard)}</MediaSection>}
            <MainFooter />
          </div>
        </div>
      );
    }

    if (view.type === "album" || view.type === "track" || view.type === "editorial") {
      const isAlbum = view.type === "album";
      const isTrack = view.type === "track";
      const title = isAlbum ? view.item.title : isTrack ? view.item.name : view.item.title;
      const image = view.item.image;
      const artistName = isAlbum || isTrack ? view.item.artist : "Spotify";
      const kind = isAlbum ? "Album" : isTrack ? "Single" : "Playlist";
      const songs = detailTracks;
      const playFirst = () => {
        if (songs.length) void playTrack(songs[0], songs);
        else if (view.type === "album") void playAlbum(view.item);
        else if (view.type === "track") void playTrack(view.item, [view.item]);
      };
      return (
        <div className="detail-view view-enter">
          <div className="collection-hero">
            <img className="collection-cover" src={image} alt="" />
            <div className="collection-copy">
              <span className="collection-type">{kind}</span>
              <h1 className={title.length > 35 ? "long-title" : ""}>{title}</h1>
              {view.type === "editorial" && <p className="collection-description">{view.item.description}</p>}
              <p className="collection-meta"><SpotifyMark size={22} color="#1ed760" /> <strong>{artistName}</strong> {isAlbum && <span>&bull; {view.item.year} &bull; {view.item.count} songs</span>}{isTrack && <span>&bull; Song</span>}{view.type === "editorial" && <span>&bull; {songs.length} songs</span>}</p>
            </div>
          </div>
          <div className="detail-body">
            <div className="detail-actions">
              <button className="large-play" type="button" aria-label={`Play ${title}`} onClick={playFirst}><Play size={26} fill="currentColor" /></button>
              <button className="plain-icon" type="button" title="Add to playlist" onClick={() => songs[0] ? setTrackToAdd(songs[0]) : setToast("Choose a song to add to a playlist.")}><Plus size={31} /></button>
              <button className="plain-icon" type="button" title="More options" onClick={() => setToast("Select a song to play a preview.")}><MoreHorizontal size={28} /></button>
            </div>
            {detailLoading ? <div className="loading-lines">Loading songs...</div> : songs.length ? (
              <TrackRows tracks={songs} onPlay={(track) => void playTrack(track, songs)} onAdd={setTrackToAdd} activeId={currentTrack?.id} isPlaying={isPlaying} showCover={view.type === "editorial"} showHeader />
            ) : <p className="muted-copy">Songs are not available right now.</p>}
            {isAlbum && <p className="album-disclaimer">{view.item.year} {view.item.artist}</p>}
            <MainFooter />
          </div>
        </div>
      );
    }

    if (view.type === "playlist" || view.type === "liked") {
      const playlist = view.type === "playlist" ? playlists.find((item) => item.id === view.id) : null;
      const songs = view.type === "liked" ? likedTracks : playlist?.tracks || [];
      const title = view.type === "liked" ? "Liked Songs" : playlist?.name || "Playlist";
      const firstImage = songs[0]?.image;
      const filteredSuggestions = trendingTracks.filter((track) => `${track.name} ${track.artist}`.toLowerCase().includes(playlistSearch.toLowerCase()));
      return (
        <div className="detail-view view-enter">
          <div className={`collection-hero ${view.type === "liked" ? "liked-hero" : "playlist-hero"}`}>
            {firstImage ? <img className="collection-cover" src={firstImage} alt="" /> : <div className="collection-cover empty-cover"><Music2 size={72} strokeWidth={1.2} /></div>}
            <div className="collection-copy"><span className="collection-type">Playlist</span><h1>{title}</h1><p className="collection-meta"><SpotifyMark size={22} color="#1ed760" /> <strong>Made by you</strong> <span>&bull; {songs.length} songs</span></p></div>
          </div>
          <div className="detail-body">
            <div className="detail-actions">
              <button className="large-play" type="button" aria-label={`Play ${title}`} disabled={!songs.length} onClick={() => songs.length && void playTrack(songs[0], songs)}><Play size={26} fill="currentColor" /></button>
              {view.type === "playlist" && playlist && <>
                <button className="plain-icon" type="button" title="Rename playlist" onClick={() => { setRenameId(playlist.id); setRenameValue(playlist.name); }}><MoreHorizontal size={28} /></button>
                <button className="delete-playlist" type="button" onClick={() => { setPlaylists((items) => items.filter((item) => item.id !== playlist.id)); navigate({ type: "home" }); setToast("Playlist deleted"); }}>Delete playlist</button>
              </>}
            </div>
            {songs.length > 0 ? (
              <TrackRows tracks={songs} onPlay={(track) => void playTrack(track, songs)} onAdd={setTrackToAdd} onRemove={view.type === "playlist" && playlist ? (track) => removeFromPlaylist(playlist.id, track.id) : undefined} activeId={currentTrack?.id} isPlaying={isPlaying} showHeader />
            ) : <div className="empty-playlist-message"><h2>Let's find something for your playlist</h2><p>Search for a song or pick something you like below.</p></div>}
            {view.type === "playlist" && playlist && <div className="playlist-finder">
              <h2>Find something for your playlist</h2>
              <div className="playlist-search-box"><Search size={18} /><input value={playlistSearch} onChange={(event) => setPlaylistSearch(event.target.value)} placeholder="Search songs" aria-label="Search songs for playlist" /></div>
              <div className="playlist-suggestions">
                {filteredSuggestions.slice(0, 5).map((track) => <div className="suggestion-row" key={track.id}>
                  <img src={track.image} alt="" /><div><strong>{track.name}</strong><span>{track.artist}</span></div>
                  <button type="button" onClick={() => addToPlaylist(playlist.id, track)}>{playlist.tracks.some((song) => song.id === track.id) ? "Added" : "Add"}</button>
                </div>)}
                {!filteredSuggestions.length && <p className="muted-copy">No local matches. Try the main search for more music.</p>}
              </div>
            </div>}
            <MainFooter />
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`app-shell ${libraryCollapsed ? "library-collapsed" : ""}`}>
      <header className="topbar">
        <button className="brand-button" type="button" aria-label="Spotify home" onClick={() => navigate({ type: "home" })}><SpotifyMark size={33} /></button>
        <div className="topbar-navigation">
          <div className="history-controls">
            <button type="button" className="history-button" aria-label="Go back" onClick={goBack} disabled={!backStack.length}><ChevronLeft size={22} /></button>
            <button type="button" className="history-button" aria-label="Go forward" onClick={goForward} disabled={!forwardStack.length}><ChevronRight size={22} /></button>
          </div>
          <button className={`home-button ${view.type === "home" ? "home-button-active" : ""}`} type="button" aria-label="Home" onClick={() => navigate({ type: "home" })}><House size={24} fill="currentColor" strokeWidth={2.1} /></button>
          <div className={`global-search ${view.type === "search" ? "global-search-active" : ""}`}>
            <Search size={25} strokeWidth={2.25} className="search-prefix" onClick={openSearch} />
            <input ref={searchRef} value={query}
              onFocus={() => view.type !== "search" && navigate({ type: "search" })}
              onChange={(event) => { setQuery(event.target.value); if (view.type !== "search") navigate({ type: "search" }); }}
              onKeyDown={(event) => { if (event.key === "Escape") { setQuery(""); searchRef.current?.blur(); } }}
              placeholder="What do you want to play?" aria-label="Search music" />
            {query && <button type="button" className="search-clear" title="Clear search" aria-label="Clear search" onClick={() => { setQuery(""); openSearch(); }}><X size={19} /></button>}
            <span className="search-divider" />
            <button type="button" className="browse-icon" title="Browse" aria-label="Browse all" onClick={() => { setQuery(""); openSearch(); }}><ListMusic size={23} strokeWidth={2} /></button>
          </div>
        </div>
        <nav className="topbar-actions" aria-label="Account and Spotify links">
          <div className="marketing-links">
            <a href="https://www.spotify.com/premium/" target="_blank" rel="noreferrer">Premium</a>
            <a href="https://support.spotify.com/" target="_blank" rel="noreferrer">Support</a>
            <a href="https://www.spotify.com/download/" target="_blank" rel="noreferrer">Download</a>
          </div>
          <span className="topbar-divider" />
          <a className="install-link" href="https://www.spotify.com/download/" target="_blank" rel="noreferrer"><Download size={17} /> <span>Install App</span></a>
          <button className="signup-link" type="button" onClick={() => setAuthModal("signup")}>Sign up</button>
          <button className="login-button" type="button" onClick={() => setAuthModal("login")}>Log in</button>
        </nav>
      </header>

      <div className="workspace">
        {mobileLibraryOpen && <div className="mobile-sidebar-scrim" onClick={() => setMobileLibraryOpen(false)} />}
        <aside className={`sidebar ${mobileLibraryOpen ? "sidebar-mobile-open" : ""}`} aria-label="Your Library">
          <div className="library-header">
            <button className="library-title" type="button" onClick={() => { if (window.innerWidth <= 700) setMobileLibraryOpen(false); else setLibraryCollapsed((value) => !value); }} title={libraryCollapsed ? "Expand Your Library" : "Collapse Your Library"}><Library size={25} strokeWidth={2} /> <span>Your Library</span></button>
            <button className="library-add" type="button" aria-label="Create a playlist" title="Create a playlist" onClick={() => createPlaylist()}><Plus size={21} /></button>
            <button className="mobile-close-library" type="button" aria-label="Close library" onClick={() => setMobileLibraryOpen(false)}><X size={22} /></button>
          </div>
          <div className="library-content">
            <div className="library-filters" aria-label="Filter your library">
              {(["All", "Playlists", "Podcasts"] as const).map((filter) => (
                <button className={`filter-chip ${libraryFilter === filter ? "selected" : ""}`} type="button" key={filter} onClick={() => setLibraryFilter(filter)}>{filter}</button>
              ))}
            </div>
            {libraryFilter === "Podcasts" || (playlists.length === 0 && likedTracks.length === 0) ? (
              <div className="library-prompts">
                {libraryFilter !== "Podcasts" && <div className="library-prompt"><h2>Create your first playlist</h2><p>It's easy, we'll help you</p><button type="button" onClick={() => createPlaylist()}>Create playlist</button></div>}
                {libraryFilter !== "Playlists" && <div className="library-prompt"><h2>Let's find some podcasts to follow</h2><p>We'll keep you updated on new episodes</p><button type="button" onClick={() => navigate({ type: "category", name: "Podcasts" })}>Browse podcasts</button></div>}
              </div>
            ) : (
              <div className="library-list">
                <div className="library-tools">
                  <span />
                  <button className="sort-button" type="button" onClick={() => setSortAlphabetically((value) => !value)}>{sortAlphabetically ? "Alphabetical" : "Recently added"}</button>
                </div>
                {likedTracks.length > 0 && <button className={`library-entry ${view.type === "liked" ? "library-entry-active" : ""}`} type="button" onClick={() => navigate({ type: "liked" })}><span className="liked-library-art"><Heart size={20} fill="white" /></span><span className="library-entry-text"><strong>Liked Songs</strong><small>Playlist &bull; {likedTracks.length} songs</small></span></button>}
                {(sortAlphabetically ? [...playlists].sort((first, second) => first.name.localeCompare(second.name)) : playlists).map((playlist) => <button className={`library-entry ${view.type === "playlist" && view.id === playlist.id ? "library-entry-active" : ""}`} type="button" key={playlist.id} onClick={() => navigate({ type: "playlist", id: playlist.id })}>
                  {playlist.tracks[0] ? <img src={playlist.tracks[0].image} alt="" /> : <span className="library-entry-art"><Music2 size={23} /></span>}
                  <span className="library-entry-text"><strong>{playlist.name}</strong><small>Playlist &bull; Made by you</small></span>
                </button>)}
                <button className="library-new-link" type="button" onClick={() => createPlaylist()}><Plus size={16} /> Create a playlist</button>
              </div>
            )}
          </div>
          <div className="sidebar-footer">
            <div className="legal-links">
              <a href="https://www.spotify.com/legal/" target="_blank" rel="noreferrer">Legal</a>
              <a href="https://www.spotify.com/safetyandprivacy/" target="_blank" rel="noreferrer">Safety &amp; Privacy Center</a>
              <a href="https://www.spotify.com/legal/privacy-policy/" target="_blank" rel="noreferrer">Privacy Policy</a>
              <a href="https://www.spotify.com/legal/cookies-policy/" target="_blank" rel="noreferrer">Cookies</a>
              <a href="https://www.spotify.com/legal/privacy-policy/#s3" target="_blank" rel="noreferrer">About Ads</a>
              <a href="https://www.spotify.com/accessibility/" target="_blank" rel="noreferrer">Accessibility</a>
            </div>
            <a className="cookies-link" href="https://www.spotify.com/legal/cookies-policy/" target="_blank" rel="noreferrer">Cookies</a>
            <div className="language-control">
              <button type="button" className="language-button" onClick={() => setLanguageOpen((open) => !open)}><Globe2 size={16} /> {language}</button>
              {languageOpen && <div className="language-menu">
                {["English", "Espa\u00f1ol", "Fran\u00e7ais"].map((option) => <button type="button" key={option} onClick={() => { setLanguage(option); setLanguageOpen(false); setToast(`Language preference: ${option}`); }}>{option}{language === option && <Check size={15} />}</button>)}
              </div>}
            </div>
          </div>
        </aside>

        <main className="main-panel" ref={mainRef}>
          {view.type === "home" && renderHome()}
          {view.type === "search" && renderSearch()}
          {view.type === "all" && renderAll()}
          {view.type === "category" && renderCategory()}
          {["artist", "album", "track", "editorial", "playlist", "liked"].includes(view.type) && renderDetail()}
        </main>
      </div>

      <div className="mobile-bottom-nav" aria-label="Mobile navigation">
        <button type="button" className={view.type === "home" ? "active" : ""} onClick={() => navigate({ type: "home" })}><House size={23} fill={view.type === "home" ? "currentColor" : "none"} /><span>Home</span></button>
        <button type="button" className={view.type === "search" ? "active" : ""} onClick={openSearch}><Search size={23} /><span>Search</span></button>
        <button type="button" onClick={() => setMobileLibraryOpen(true)}><Library size={23} /><span>Your Library</span></button>
      </div>

      {currentTrack ? (
        <div className="player-bar">
          <div className="player-song"><img src={currentTrack.image} alt="" />
            <div className="player-song-text"><button type="button" onClick={() => navigate({ type: "track", item: currentTrack })}>{currentTrack.name}</button><span>{currentTrack.artist}</span></div>
            <button type="button" className={`player-like ${likedTracks.some((track) => track.id === currentTrack.id) ? "liked" : ""}`} title="Save to Liked Songs" aria-label="Save to Liked Songs" onClick={() => toggleLike(currentTrack)}><Heart size={18} fill={likedTracks.some((track) => track.id === currentTrack.id) ? "currentColor" : "none"} /></button>
          </div>
          <div className="player-center">
            <div className="player-controls">
              <button type="button" className={shuffle ? "control-on" : ""} aria-label="Shuffle" title="Shuffle" onClick={() => setShuffle((value) => !value)}><Shuffle size={17} /></button>
              <button type="button" aria-label="Previous song" title="Previous" onClick={playPrevious}><SkipBack size={19} fill="currentColor" /></button>
              <button type="button" className="player-main-control" aria-label={isPlaying ? "Pause" : "Play"} onClick={togglePlayback} disabled={audioLoading}>{isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button>
              <button type="button" aria-label="Next song" title="Next" onClick={playNext}><SkipForward size={19} fill="currentColor" /></button>
              <button type="button" className={repeat ? "control-on" : ""} aria-label="Repeat" title="Repeat" onClick={() => setRepeat((value) => !value)}><Repeat2 size={17} /></button>
            </div>
            <div className="player-timeline"><span>{formatTime(progress)}</span><input type="range" min="0" max={previewDuration || 30} step="0.1" value={Math.min(progress, previewDuration || 30)} style={{ "--range-fill": `${Math.min(100, (progress / (previewDuration || 30)) * 100)}%` } as CSSProperties} aria-label="Seek preview" onChange={(event) => { const time = Number(event.target.value); seekTo(time); setProgress(time); }} /><span>{formatTime(previewDuration)}</span></div>
          </div>
          <div className="player-extras">
            <span className="preview-label">{playerMode === "youtube" ? "YouTube" : "Preview"}</span>
            <button type="button" title="Lyrics unavailable in preview" aria-label="Lyrics unavailable in preview" onClick={() => setToast("Lyrics are not available in the demo preview.")}><Mic2 size={17} /></button>
            <button type="button" title="Queue" aria-label="Queue" onClick={() => setToast(`${queue.length} songs in your queue`)}><ListMusic size={18} /></button>
            <button type="button" title={volume === 0 ? "Unmute" : "Mute"} aria-label={volume === 0 ? "Unmute" : "Mute"} onClick={() => { if (volume === 0) { setVolume(lastVolume || 75); setEngineVolume(lastVolume || 75); } else { setLastVolume(volume); setVolume(0); setEngineVolume(0); } }}>{volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
            <input className="volume-range" type="range" min="0" max="100" value={volume} style={{ "--range-fill": `${volume}%` } as CSSProperties} aria-label="Volume" onChange={(event) => { const value = Number(event.target.value); setVolume(value); setEngineVolume(value); }} />
            <button type="button" title="Fullscreen" aria-label="Fullscreen" onClick={() => document.documentElement.requestFullscreen?.().catch(() => setToast("Fullscreen is not available."))}><Maximize2 size={16} /></button>
          </div>
        </div>
      ) : (
        <div className="preview-banner"><div className="preview-copy"><strong>Preview of Spotify</strong><span>Sign up to get unlimited songs and podcasts with occasional ads. No credit card needed.</span></div><button type="button" onClick={() => setAuthModal("signup")}>Sign up free</button></div>
      )}

      <audio ref={audioRef}
        onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setPreviewDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 30)}
        onEnded={handleEnded}
        onError={() => { if (currentTrack && !audioLoading) { setIsPlaying(false); setToast("This preview could not be played."); } }} />

      <div ref={ytBoxRef} className={`yt-mini ${playerMode === "youtube" && currentTrack ? "" : "yt-hidden"}`} aria-label="YouTube player" />

      {toast && <div className="toast" role="status">{toast}</div>}

      {authModal && <div className="modal-backdrop" onMouseDown={() => setAuthModal(null)}>
        <div className="auth-dialog modal-enter" role="dialog" aria-modal="true" aria-label={authModal === "signup" ? "Sign up" : "Log in"} onMouseDown={(event) => event.stopPropagation()}>
          <button className="modal-close" type="button" aria-label="Close" onClick={() => setAuthModal(null)}><X size={22} /></button>
          <SpotifyMark size={44} color="#1ed760" />
          <h2>{authModal === "signup" ? "Start listening with Spotify" : "Log in to Spotify"}</h2>
          <p>This is an interactive web player demo. Play previews, explore music, and make playlists here. For your real Spotify account, continue securely on Spotify.</p>
          <a className="modal-primary" href={authModal === "signup" ? "https://www.spotify.com/signup" : "https://accounts.spotify.com/en/login"} target="_blank" rel="noreferrer">Continue to Spotify <ExternalLink size={16} /></a>
          <button className="modal-secondary" type="button" onClick={() => { setAuthModal(null); setToast("Enjoy exploring the demo player."); }}>Keep exploring the demo</button>
        </div>
      </div>}

      {trackToAdd && <div className="modal-backdrop" onMouseDown={() => setTrackToAdd(null)}>
        <div className="small-dialog modal-enter" role="dialog" aria-modal="true" aria-label="Add to playlist" onMouseDown={(event) => event.stopPropagation()}>
          <button className="modal-close" type="button" aria-label="Close" onClick={() => setTrackToAdd(null)}><X size={21} /></button>
          <h2>Add to playlist</h2>
          <div className="add-track-preview"><img src={trackToAdd.image} alt="" /><span><strong>{trackToAdd.name}</strong><small>{trackToAdd.artist}</small></span></div>
          <div className="playlist-choice-list">
            {playlists.map((playlist) => <button type="button" key={playlist.id} onClick={() => addToPlaylist(playlist.id, trackToAdd)}><span className="choice-art"><Music2 size={19} /></span><span>{playlist.name}</span><Plus size={17} /></button>)}
            <button type="button" onClick={() => createPlaylist(trackToAdd)}><span className="choice-art"><Plus size={20} /></span><span>Create new playlist</span><ArrowRight size={17} /></button>
          </div>
        </div>
      </div>}

      {renameId && <div className="modal-backdrop" onMouseDown={() => setRenameId(null)}>
        <form className="small-dialog rename-dialog modal-enter" role="dialog" aria-modal="true" aria-label="Rename playlist" onMouseDown={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); if (!renameValue.trim()) return; setPlaylists((items) => items.map((playlist) => playlist.id === renameId ? { ...playlist, name: renameValue.trim() } : playlist)); setRenameId(null); setToast("Playlist renamed"); }}>
          <button className="modal-close" type="button" aria-label="Close" onClick={() => setRenameId(null)}><X size={21} /></button>
          <h2>Rename playlist</h2><label htmlFor="playlist-name">Playlist name</label>
          <input id="playlist-name" autoFocus value={renameValue} onChange={(event) => setRenameValue(event.target.value)} maxLength={60} />
          <button className="save-name" type="submit">Save</button>
        </form>
      </div>}
    </div>
  );
}