# music-engines
## Async Audio Analysis Kernel

**Tier:** Secondary Project  
**Type:** Backend Infrastructure / Research Pipeline  
**Status:** Active / Operational  
**Stack:** Python · asyncio · librosa · ChromaDB · Neo4j · FastAPI · Whisper · pyworld  
**Role:** Backend infrastructure for AI music research across TEBR, HAH-WAS, and DERIVE  

---

## What It Is

The research programs in this portfolio — the Localization Gap audit, TEBR's glitch taxonomy, DERIVE's generation pipeline — all share a requirement: the ability to analyze large volumes of audio files at speed, extract meaningful acoustic and cultural features, and persist those features in a queryable graph structure.

music-engines is the infrastructure that makes this possible.

It is not a consumer-facing product. It is a backend kernel — a collection of modular pipeline components that handle the computational work of large-scale audio analysis so the research layer can focus on what the data means rather than how to extract it.

---

## Pipeline Architecture

| Module | Function | Technologies |
|--------|----------|-------------|
| **INGEST WORKER** | Async audio file ingestion with format normalization. Handles batch processing of large directories without blocking. Maintains a processing queue with retry logic for failed extractions. | Python asyncio, librosa, ffmpeg |
| **SPECTRAL ANALYSIS** | Extracts acoustic features: spectral centroid, MFCC coefficients, chroma vectors, zero-crossing rate, onset strength, tempo estimation. The feature set is configurable per analysis task. | librosa, scipy, numpy |
| **CULTURAL FEATURE EXTRACTION** | Beyond standard acoustic features: microtonal interval detection, rhythmic cycle classification (maqam vs. Western), dialect identification signals in vocal tracks, code-switching detection in multilingual audio. | Custom models, Whisper (transcription), pyworld (pitch analysis) |
| **GRAPH PERSISTENCE** | Stores extracted features as a queryable graph where tracks are nodes and feature similarity creates weighted edges. Enables similarity search, cluster analysis, and pattern detection across large corpora. | Neo4j / NetworkX, custom similarity functions |
| **API LAYER** | FastAPI endpoints for querying the analysis graph, retrieving feature vectors, and triggering new analysis jobs. Used by DERIVE's MEMORY module and the HAH-WAS verification pipeline. | FastAPI, Pydantic, SQLAlchemy |

---

## What It Enables: The Research Infrastructure Argument

Without music-engines, the 427-track Localization Gap audit would have been a listening exercise — important, but not scalable and not reproducible.

With music-engines, the audit is a structured analysis: each track is processed through a consistent feature extraction pipeline, features are stored in a persistent graph, and queries against that graph produce the quantifiable findings that make the research credible rather than impressionistic.

**This is the difference between a musician with opinions about AI and a researcher with data about AI.** music-engines is the infrastructure that produces the data.

For AI music company positioning — Suno, Udio, or equivalent — the existence of this pipeline demonstrates a specific capability: the ability to build the QA infrastructure that would allow a company to systematically audit its model outputs for cultural accuracy at scale, rather than relying on ad-hoc listening tests.

---

## Upstream and Downstream

**Upstream dependencies:**
- HAH-WAS provides the cultural feature specifications that music-engines implements
- TEBR's glitch taxonomy informs what "productive failure" looks like in the feature space

**Downstream consumers:**
- DERIVE's MEMORY module queries the analysis graph for emotionally adjacent fragments
- The Localization Gap white paper cites the pipeline's output as its primary data source
- HAH-WAS verification passes run against features extracted by music-engines

---

## Visibility Strategy

music-engines is infrastructure — invisible by design, essential in practice. Making it visible requires:

1. **Technical write-up** (this document)
2. **Open-source publication** — releasing the pipeline as a public tool positions the research program as a contribution to the field, not just an internal audit
3. **Dataset publication** — the 427-track feature set, anonymized and published, becomes a citable research artifact

**Strategic frame:** Strongest proof of production-grade backend engineering capability in the portfolio. Demonstrates that the AI music research program isn't just running prompts and listening to outputs, but building the analysis infrastructure to process those outputs at scale.
