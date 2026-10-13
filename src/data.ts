export type Track = {
  id: number;
  name: string;
  artist: string;
  image: string;
  albumId?: number;
  artistId?: number;
  duration?: number;
  explicit?: boolean;
  previewUrl?: string;
};

export type Artist = {
  id: number;
  name: string;
  image: string;
};

export type Album = {
  id: number;
  title: string;
  artist: string;
  image: string;
  artistId?: number;
  year?: number;
  count?: number;
};

export type Editorial = {
  id: string;
  title: string;
  description: string;
  image: string;
};

export type Podcast = {
  id: string;
  title: string;
  publisher: string;
  image: string;
};

export type Playlist = {
  id: string;
  name: string;
  tracks: Track[];
};

const cover = (hash: string) =>
  `https://cdn-images.dzcdn.net/images/cover/${hash}/500x500-000000-80-0-0.jpg`;

export const trendingTracks: Track[] = [
  {
    id: 4306586472,
    name: "BURN (feat. Ava Max)",
    artist: "BigXthaPlug, Ava Max",
    image: cover("3b0c5b47ac7b66959d79d2f19a484839"),
    albumId: 1104755342,
    artistId: 75832332,
    duration: 90,
    explicit: true,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8b/e2/b2/8be2b227-7056-90e1-fd76-680c7e63893d/mzaf_9558616550288809739.plus.aac.p.m4a",
  },
  {
    id: 4323306672,
    name: "Champagne",
    artist: "Remi Wolf",
    image: cover("32a387a575b7b25cfbe4a52571092d91"),
    albumId: 1111624572,
    artistId: 14425359,
    duration: 210,
    explicit: true,
  },
  {
    id: 4323142102,
    name: "Are We Ever Gonna Work Out, Baby?",
    artist: "Joshua Slone",
    image: cover("8a3ae324cdb7090f03383a9b0ce79fd7"),
    albumId: 1111548542,
    artistId: 176038697,
    duration: 171,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/fd/d3/3f/fdd33fdd-2841-3235-a26d-827300bf25f3/mzaf_48678253409796051.plus.aac.p.m4a",
  },
  {
    id: 4337642142,
    name: "pop it",
    artist: "Gunna",
    image: cover("08ced6a6e0d1f5b312ae78b72958fae3"),
    albumId: 1117460302,
    artistId: 4344192,
    duration: 138,
    explicit: true,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8d/b4/22/8db422a9-8f7a-6863-6a47-1249696f012b/mzaf_9062412188855492119.plus.aac.p.m4a",
  },
  {
    id: 4337604802,
    name: "Suzuki (from GTAVI: The Album)",
    artist: "Fuerza Regida, Grand Theft Auto VI",
    image: cover("dc492b8d028525c713a52713b9bb005d"),
    albumId: 1117444782,
    artistId: 13916083,
    duration: 111,
    explicit: true,
  },
  {
    id: 4329632782,
    name: "i think he's got a girl",
    artist: "Slayyyter",
    image: cover("2031007b9cdf4394bd52864e98bafd27"),
    albumId: 1114388442,
    artistId: 50452132,
    duration: 214,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/6f/a7/15/6fa715fe-478e-50f9-91af-006c6464c984/mzaf_13100065609544659800.plus.aac.p.m4a",
  },
  {
    id: 4323354522,
    name: "Canada Dry",
    artist: "Troye Sivan",
    image: cover("902bb3c0bc5d2d51359b2410df38b74a"),
    albumId: 1111642052,
    artistId: 4746199,
    duration: 201,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/1c/4c/fd/1c4cfd36-3550-0cb6-eb66-fb56478af699/mzaf_10586071529218361979.plus.aac.p.m4a",
  },
  {
    id: 4323279162,
    name: "Vuelve",
    artist: "Anuel AA",
    image: cover("2889a798f4ebdefa59da5233f9cd58bb"),
    albumId: 1111612082,
    artistId: 7961888,
    duration: 290,
    explicit: true,
  },
  {
    id: 4332618572,
    name: "MADARA (with Eminem)",
    artist: "EZ MIL, Eminem, Neil Kaplan, Hideyoshi",
    image: cover("d0e4634bba4f2a2f8d563e5b70ea2f3e"),
    albumId: 1115568982,
    artistId: 49913072,
    duration: 294,
    explicit: true,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/1c/c7/51/1cc751b5-6db5-a722-1ebf-6908560b04b8/mzaf_17402968530820882530.plus.aac.p.m4a",
  },
  {
    id: 3050380851,
    name: "APT.",
    artist: "ROS\u00c9, Bruno Mars",
    image: cover("258e6042338ce64bb4157c0c94b232ac"),
    albumId: 658285691,
    artistId: 126335112,
    duration: 169,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/7a/15/38/7a1538f3-f41a-a2eb-0f24-8eb6712ee043/mzaf_7740628412097685267.plus.aac.p.m4a",
  },
  {
    id: 2947516331,
    name: "Die With A Smile",
    artist: "Lady Gaga, Bruno Mars",
    image: cover("4bd5903f4ce8f2601916bfadb44efe8a"),
    albumId: 629506181,
    artistId: 75491,
    duration: 250,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/07/6a/99/076a99ed-b946-431b-6f1f-54fa187ca5bd/mzaf_8102882277995122875.plus.aac.p.m4a",
  },
];

export const popularArtists: Artist[] = [
  {
    id: 525046,
    name: "Kendrick Lamar",
    image: "https://image-cdn-ak.spotifycdn.com/image/ab6761610000517439ba6dcd4355c03de0b50918",
  },
  {
    id: 246791,
    name: "Drake",
    image: "https://image-cdn-fa.spotifycdn.com/image/ab676161000051744293385d324db8558179afd9",
  },
  {
    id: 4050205,
    name: "The Weeknd",
    image: "https://image-cdn-fa.spotifycdn.com/image/ab67616100005174c1719ac9e6a75c1c25835018",
  },
  {
    id: 7188840,
    name: "Morgan Wallen",
    image: "https://image-cdn-fa.spotifycdn.com/image/ab6761610000517498a9ee5f9cac5e3efa057f30",
  },
  {
    id: 7543848,
    name: "Post Malone",
    image: "https://image-cdn-fa.spotifycdn.com/image/ab67616100005174e17c0aa1714a03d62b5ce4e0",
  },
  {
    id: 564,
    name: "Rihanna",
    image: "https://image-cdn-fa.spotifycdn.com/image/ab67616100005174cb565a8e684e3be458d329ac",
  },
  {
    id: 75491,
    name: "Lady Gaga",
    image: "https://image-cdn-fa.spotifycdn.com/image/ab67616100005174aadc18cac8d48124357c38e6",
  },
  {
    id: 9635624,
    name: "Billie Eilish",
    image: "https://image-cdn-ak.spotifycdn.com/image/ab676161000051744a21b4760d2ecb7b0dcdc8da",
  },
  {
    id: 12246,
    name: "Taylor Swift",
    image: "https://image-cdn-fa.spotifycdn.com/image/ab6761610000517412184bdd29403de54cb9d9c7",
  },
  {
    id: 230,
    name: "Kanye West",
    image: "https://image-cdn-ak.spotifycdn.com/image/ab676161000051746e835a500e791bf9c27a422a",
  },
];

export const popularAlbums: Album[] = [
  {
    id: 756668921,
    title: "I\u2019m The Problem",
    artist: "Morgan Wallen",
    artistId: 7188840,
    image: cover("22c6d080209e45ef58cca3596bf95e71"),
    year: 2025,
    count: 37,
  },
  {
    id: 693008911,
    title: "DeB\u00cd TiRAR M\u00e1S FOToS",
    artist: "Bad Bunny",
    artistId: 10583405,
    image: cover("d98eaccfbb945bdf68241d6de7fe6a49"),
    year: 2025,
    count: 17,
  },
  {
    id: 608429572,
    title: "10 Hours of Continuous Rain Sounds for Sleeping",
    artist: "White Noise Radiance, Rain Sounds",
    image: cover("12471ba1ba278bca1a47cd01ae9d35ae"),
    year: 2024,
    count: 100,
  },
  {
    id: 586786102,
    title: "HIT ME HARD AND SOFT",
    artist: "Billie Eilish",
    artistId: 9635624,
    image: cover("5d284b31cb9ddeb1a0c79aede5a94e1c"),
    year: 2024,
    count: 10,
  },
  {
    id: 674017741,
    title: "GNX",
    artist: "Kendrick Lamar",
    artistId: 525046,
    image: cover("da5256ff8cacfe9ad90521f6e3792259"),
    year: 2024,
    count: 12,
  },
  {
    id: 1100239682,
    title: "$ome $exy $ongs 4 U",
    artist: "PARTYNEXTDOOR, Drake",
    artistId: 4925172,
    image: cover("2f2f706059ac2ada8587fa0799ff8fbd"),
    year: 2025,
    count: 21,
  },
  {
    id: 727466171,
    title: "MUSIC",
    artist: "Playboi Carti",
    artistId: 10002824,
    image: cover("8848c366508735e513fed3e2c6f2a6d1"),
    year: 2025,
    count: 30,
  },
  {
    id: 631839161,
    title: "Short n' Sweet",
    artist: "Sabrina Carpenter",
    artistId: 1176900,
    image: cover("0fd6e3b346b959a8781ccfa89b63607a"),
    year: 2024,
    count: 12,
  },
];

export const editorials: Editorial[] = [
  {
    id: "37i9dQZF1DXcBWIGoYBM5M",
    title: "Today's Top Hits",
    description: "The hottest songs you need to hear right now.",
    image: "https://i.scdn.co/image/ab67706f00000002526040498d89ec622e9d3495",
  },
  {
    id: "37i9dQZF1DX0XUsuxWHRQd",
    title: "RapCaviar",
    description: "New music from the biggest names in hip-hop.",
    image: "https://i.scdn.co/image/ab67706f00000002785c58430ad4196ef17ab19d",
  },
  {
    id: "37i9dQZF1DX0kbJZpiYdZl",
    title: "Hot Hits USA",
    description: "The hottest tracks in the United States.",
    image: "https://i.scdn.co/image/ab67706f000000020af5d3afe24316748a2a1bbd",
  },
  {
    id: "37i9dQZF1DX5Ejj0EkURtP",
    title: "All Out 2010s",
    description: "The biggest songs of the 2010s.",
    image: "https://i.scdn.co/image/ab67706f00000002ddeb90231491c14812b062ff",
  },
  {
    id: "37i9dQZF1DX4sWSpwq3LiO",
    title: "Peaceful Piano",
    description: "Relax and indulge with beautiful piano pieces.",
    image: "https://i.scdn.co/image/ab67706f0000000270e1fb7db7b45809d6a80377",
  },
  {
    id: "37i9dQZF1DWWQRwui0ExPn",
    title: "lofi beats",
    description: "Chill beats, lofi vibes, and a little peace.",
    image: "https://i.scdn.co/image/ab67706f00000002266beb50b0032b0f140a749e",
  },
];

export const podcastPicks: Podcast[] = [
  {
    id: "4rOoJ6Egrf8K2IrywzwOMk",
    title: "The Joe Rogan Experience",
    publisher: "Joe Rogan",
    image: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/2e/66/e8/2e66e849-207e-095a-d60f-6dbdb4fcafb5/mza_14425023460891140426.jpeg/600x600bb.jpg",
  },
  {
    id: "7iQXmUT7XGuZSzAMjoNWlX",
    title: "The Diary Of A CEO",
    publisher: "Steven Bartlett",
    image: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/69/af/0d/69af0ddd-1e0f-7ae3-c84b-88f18e31ad0c/mza_14445920128472365296.png/600x600bb.jpg",
  },
  {
    id: "79CkJF3UJTHFV8Dse3Oy0P",
    title: "Huberman Lab",
    publisher: "Scicomm Media",
    image: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/9a/d3/19/9ad31912-0b5a-a16e-2d7c-9fd074698b9c/mza_8994222203629500925.jpg/600x600bb.jpg",
  },
  {
    id: "3DgfoleqaW61T2amZQKINx",
    title: "Crime Junkie",
    publisher: "audiochuck",
    image: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/8c/35/04/8c350430-2fbf-98d0-0a25-00b76550ffeb/mza_13445204151221888086.jpg/600x600bb.jpg",
  },
];

export const browseCategories = [
  { name: "Music", color: "#dc148c", image: popularAlbums[1].image },
  { name: "Podcasts", color: "#006450", image: podcastPicks[0].image },
  { name: "Live Events", color: "#8400e7", image: popularAlbums[3].image },
  { name: "Made For You", color: "#1e3264", image: editorials[5].image },
  { name: "New Releases", color: "#e8115b", image: trendingTracks[0].image },
  { name: "Pop", color: "#148a08", image: popularAlbums[7].image },
  { name: "Hip-Hop", color: "#ba5d07", image: popularAlbums[4].image },
  { name: "Rock", color: "#e91429", image: editorials[3].image },
  { name: "Latin", color: "#e1118c", image: popularAlbums[1].image },
  { name: "Dance / Electronic", color: "#d84000", image: trendingTracks[9].image },
  { name: "Mood", color: "#e6b300", image: editorials[4].image },
  { name: "Charts", color: "#8d67ab", image: editorials[0].image },
  { name: "Indie", color: "#608108", image: trendingTracks[1].image },
  { name: "Workout", color: "#777777", image: editorials[1].image },
  { name: "R&B", color: "#d84000", image: popularAlbums[5].image },
  { name: "Focus", color: "#503750", image: editorials[5].image },
];