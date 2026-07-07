# Project Image Intake

Create or use a project folder named after the project slug:

```txt
public/images/projects/{slug}/
  001-hero-name.webp
  002-process-name.webp
  003-video-poster-name.webp
```

Use WebP, sRGB, and preserve original aspect ratio.

- Hero: long edge around 2800px, quality around 82
- Rail: long edge around 2000px, quality around 80
- Thumbnail/poster: long edge around 1000px, quality around 75

Then reference the filename in `content/projects/{slug}/gallery.csv`.
