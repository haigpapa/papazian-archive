const baseNodes = [
  {
    "title": "Systems Choreography",
    "category": "Robotics",
    "thumbnail": "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=512&h=320&auto=format&fit=crop",
    "accentColor": "#4a7fa8"
  },
  {
    "title": "MEKENA NYC",
    "category": "Architecture",
    "thumbnail": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=512&h=320&auto=format&fit=crop",
    "accentColor": "#8fa8c2"
  },
  {
    "title": "Impossible Instruments",
    "category": "Sound Design",
    "thumbnail": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=512&h=320&auto=format&fit=crop",
    "accentColor": "#666a6f"
  },
  {
    "title": "Bureaucratic Brutalism",
    "category": "Visual Arts",
    "thumbnail": "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=512&h=320&auto=format&fit=crop",
    "accentColor": "#c8cacc"
  },
  {
    "title": "Cyber-Noir Archive",
    "category": "Digital Humanities",
    "thumbnail": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=512&h=320&auto=format&fit=crop",
    "accentColor": "#4a7fa8"
  },
  {
    "title": "Rhythmic Choreography",
    "category": "Performance",
    "thumbnail": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=512&h=320&auto=format&fit=crop",
    "accentColor": "#8fa8c2"
  },
  {
    "title": "Spatial Displacement",
    "category": "Installation",
    "thumbnail": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=512&h=320&auto=format&fit=crop",
    "accentColor": "#666a6f"
  },
  {
    "title": "Digital Migration",
    "category": "Social Media",
    "thumbnail": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=512&h=320&auto=format&fit=crop",
    "accentColor": "#c8cacc"
  },
  {
    "title": "Algorithmic Identity",
    "category": "Research",
    "thumbnail": "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=512&h=320&auto=format&fit=crop",
    "accentColor": "#4a7fa8"
  }
];

const nodes = [];
for (let i = 0; i < 99; i++) {
  const base = baseNodes[i % baseNodes.length];
  nodes.push({
    id: i + 1,
    slug: `node-${i + 1}`,
    title: `${base.title} ${Math.floor(i / baseNodes.length) + 1}`,
    year: (2024 - Math.floor(i / 10)).toString(),
    category: base.category,
    shortDescription: `A spatial exploration of ${base.title.toLowerCase()} in a modern context.`,
    fullDescription: `Full expansive archival entry for project ${i + 1}. This node represents a specific point in the development of ${base.category.toLowerCase()} during the years of research. By utilizing spatial coordinates, we can map the trajectory of creative outputs across the landscape of several distinct disciplines.`,
    thumbnail: base.thumbnail,
    tags: ["spatial", "archival", "curated"],
    accentColor: base.accentColor
  });
}

console.log(JSON.stringify(nodes, null, 2));
