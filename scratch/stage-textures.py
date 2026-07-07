import os
import re

filepath = "src/core/NodeManager.ts"
with open(filepath, "r") as f:
    content = f.read()

# 1. Add unhydrated array to NodeManager class
unhydrated = """  private placeholderTexture: THREE.CanvasTexture | null = null;
  private unhydratedMeshes: { mesh: THREE.Mesh, asset: any, data: any, primarySrc: string, customAspect: number }[] = [];"""
content = content.replace("  private placeholderTexture: THREE.CanvasTexture | null = null;", unhydrated)

# 2. Modify createNodes loop
create_nodes_old = """        if (isGeneratedCard) {
          texture = this.createCardTexture(asset, data, slideType, customAspect);
          textureLoaded = true;
        } else if (assetIndex === 0) {
          const primarySrc = asset.poster || asset.src || data.thumbnail;
          texture = loader.load("""
create_nodes_new = """        if (isGeneratedCard) {
          texture = this.createCardTexture(asset, data, slideType, customAspect);
          textureLoaded = true;
        } else if (assetIndex === 0) {
          const primarySrc = asset.poster || asset.src || data.thumbnail;
          const isCore = data.tier === 'lead' || data.slug === 'tebr';
          
          if (isCore) {
            texture = loader.load("""
content = content.replace(create_nodes_old, create_nodes_new)

create_nodes_end_old = """        } else {
          texture = this.placeholderTexture;
        }"""
create_nodes_end_new = """          } else {
            texture = this.placeholderTexture;
            // We will hydrate this later, after the mesh is created
            setTimeout(() => {
                if (mesh) {
                    this.unhydratedMeshes.push({ mesh, asset, data, primarySrc, customAspect });
                }
            }, 0);
          }
        } else {
          texture = this.placeholderTexture;
        }"""
content = content.replace(create_nodes_end_old, create_nodes_end_new)

# 3. Add hydrate function
hydrate_func = """  public hydrateSecondaryTextures() {
    if (this.unhydratedMeshes.length === 0) return;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    
    // Process in small batches so we don't block the main thread
    const batchSize = 10;
    const batch = this.unhydratedMeshes.splice(0, batchSize);
    
    batch.forEach(({ mesh, asset, data, primarySrc, customAspect }) => {
      loader.load(
        primarySrc,
        (loadedTexture) => {
          const image = loadedTexture.image;
          if (image?.width && image?.height && mesh && mesh.material) {
            mesh.userData.imageAspect = image.width / image.height;
            const mat = mesh.material as THREE.ShaderMaterial;
            if (mat.uniforms) {
              mat.uniforms.uMap.value = loadedTexture;
              mat.uniforms.uAspect.value = mesh.userData.imageAspect;
              loadedTexture.colorSpace = THREE.SRGBColorSpace;
              this.scheduleRelayout();
            }
          }
        },
        undefined,
        (err) => {
          const fallbackSrc = primarySrc.replace(/\.webp$/, '.jpg');
          if (fallbackSrc !== primarySrc) {
            loader.load(
              fallbackSrc,
              (fallbackTexture) => {
                const image = fallbackTexture.image;
                if (image?.width && image?.height && mesh && mesh.material) {
                  mesh.userData.imageAspect = image.width / image.height;
                  const mat = mesh.material as THREE.ShaderMaterial;
                  if (mat.uniforms) {
                    mat.uniforms.uMap.value = fallbackTexture;
                    mat.uniforms.uAspect.value = mesh.userData.imageAspect;
                    fallbackTexture.colorSpace = THREE.SRGBColorSpace;
                    this.scheduleRelayout();
                  }
                }
              }
            );
          } else {
            const ytId = asset.youtubeId || data.youtubeId;
            if (ytId) {
              const ytThumb = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
              loader.load(ytThumb, (ytTex) => {
                const image = ytTex.image;
                if (image?.width && image?.height && mesh && mesh.material) {
                  mesh.userData.imageAspect = image.width / image.height;
                  const mat = mesh.material as THREE.ShaderMaterial;
                  if (mat.uniforms) {
                    mat.uniforms.uMap.value = ytTex;
                    mat.uniforms.uAspect.value = mesh.userData.imageAspect;
                    ytTex.colorSpace = THREE.SRGBColorSpace;
                    this.scheduleRelayout();
                  }
                }
              });
            }
          }
        }
      );
    });
    
    if (this.unhydratedMeshes.length > 0) {
      setTimeout(() => this.hydrateSecondaryTextures(), 150);
    }
  }

  public switchMode(mode: string) {"""
content = content.replace("  public switchMode(mode: string) {", hydrate_func)

# 4. Trigger hydration when switching to grid mode
switch_mode_old = """    this.activeMode = mode;
    this.scheduleRelayout();"""
switch_mode_new = """    this.activeMode = mode;
    if (mode === 'grid' || mode === 'map') {
      this.hydrateSecondaryTextures();
    }
    this.scheduleRelayout();"""
content = content.replace(switch_mode_old, switch_mode_new)


with open(filepath, "w") as f:
    f.write(content)
print("Updated NodeManager.ts")
