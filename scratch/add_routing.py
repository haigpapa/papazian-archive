import os
import re

filepath = "src/App.tsx"
with open(filepath, "r") as f:
    content = f.read()

# 1. Add helpers at the top level
helpers = """
const getModeFromPath = (path: string): AppMode => {
  if (path.startsWith('/works')) return 'vertical';
  if (path.startsWith('/index')) return 'grid';
  if (path.startsWith('/map')) return 'map';
  if (path.startsWith('/essays')) return 'essays';
  if (path.startsWith('/case-studies')) return 'horizontal';
  return 'cylinder';
};

const getPathFromMode = (mode: AppMode, node?: any): string => {
  if (mode === 'vertical') return '/works';
  if (mode === 'grid') return '/index';
  if (mode === 'map') return '/map';
  if (mode === 'essays') return '/essays';
  if (mode === 'horizontal' && node) return `/case-studies/${node.slug}`;
  return '/orbit';
};
"""

content = content.replace("export default function App() {", helpers + "\nexport default function App() {")

# 2. Add popstate listener effect
popstate_effect = """
  // Client-Side Routing: initial load & popstate
  useEffect(() => {
    if (!isReady || nodes.length === 0) return;

    const handlePopState = () => {
      const path = window.location.pathname;
      const targetMode = getModeFromPath(path);
      
      if (targetMode === 'horizontal') {
        const slug = path.replace('/case-studies/', '');
        const node = nodes.find(n => n.slug === slug);
        if (node) {
          retargetProjectRail(node);
        } else {
          handleModeChange('cylinder');
        }
      } else {
        if (currentModeRef.current !== targetMode) {
          handleModeChange(targetMode);
        }
      }
    };

    // Only run on first ready or popstate
    window.addEventListener('popstate', handlePopState);
    
    // Initial sync
    const initialPath = window.location.pathname;
    if (initialPath !== '/' && initialPath !== '/orbit') {
      handlePopState();
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [isReady, nodes]);
"""

# Insert popstate effect after `useEffect(() => { currentModeRef.current = currentMode; }, [currentMode]);`
content = content.replace("  useEffect(() => {\n    currentModeRef.current = currentMode;\n  }, [currentMode]);", popstate_effect + "\n  useEffect(() => {\n    currentModeRef.current = currentMode;\n  }, [currentMode]);")

# 3. Modify handleModeChange to pushState
handle_mode_change_old = """  const handleModeChange = (mode: AppMode) => {
    if (mode === 'horizontal' && !activeNode) return;"""
handle_mode_change_new = """  const handleModeChange = (mode: AppMode, targetNode?: any) => {
    if (mode === 'horizontal' && !activeNode && !targetNode) return;
    
    const nodeToUse = targetNode || activeNode;
    const newPath = getPathFromMode(mode, nodeToUse);
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
"""
content = content.replace(handle_mode_change_old, handle_mode_change_new)

# 4. In handleCloseNode and handleBackToWorks, we should use handleModeChange to sync URL!
handle_close_old = """    if (currentMode === 'horizontal') {
      currentModeRef.current = returnMode;
      setCurrentMode(returnMode);
      sceneRef.current?.switchMode(returnMode);
      audioEngine.setMode(returnMode);
    }"""
handle_close_new = """    if (currentMode === 'horizontal') {
      handleModeChange(returnMode);
    }"""
content = content.replace(handle_close_old, handle_close_new)

handle_back_old = """    returnModeRef.current = 'vertical';
    setReturnMode('vertical');
    currentModeRef.current = 'vertical';
    setCurrentMode('vertical');
    sceneRef.current?.switchMode('vertical');
    sceneRef.current?.resetFocus();
    audioEngine.setMode('vertical');"""
handle_back_new = """    returnModeRef.current = 'vertical';
    setReturnMode('vertical');
    handleModeChange('vertical');
    sceneRef.current?.resetFocus();"""
content = content.replace(handle_back_old, handle_back_new)

# 5. In openProjectRail, we should pushState
open_rail_old = """    currentModeRef.current = 'horizontal';
    setCurrentMode('horizontal');
    sceneRef.current?.switchMode('horizontal');"""
open_rail_new = """    handleModeChange('horizontal', node);"""
content = content.replace(open_rail_old, open_rail_new)

# 6. In retargetProjectRail, we should pushState
retarget_rail_old = """    currentModeRef.current = 'horizontal';
    setCurrentMode('horizontal');
    sceneRef.current?.switchMode('horizontal');"""
retarget_rail_new = """    handleModeChange('horizontal', node);"""
content = content.replace(retarget_rail_old, retarget_rail_new)

with open(filepath, "w") as f:
    f.write(content)
print("Updated App.tsx")
