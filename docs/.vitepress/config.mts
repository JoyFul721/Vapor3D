
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Vapor3D Doc',
  description: 'WebGL2 3D Rendering Extension for TurboWarp',
  base: '/Vapor3D/',
  appearance: 'dark',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/getting-started' },
      { text: 'API', link: '/engine/shader' }
    ],
    sidebar: [
      { text: 'Getting Started', items: [
        { text: 'Introduction', link: '/' },
        { text: 'Installation', link: '/getting-started' }
      ]},
      { text: 'Engine', items: [
        { text: 'Core', link: '/engine/core' },
        { text: 'Shader', link: '/engine/shader' },
        { text: 'VAO', link: '/engine/vao' },
        { text: 'Texture', link: '/engine/texture' },
        { text: 'Framebuffer', link: '/engine/framebuffer' }
      ]},
      { text: 'Scene', items: [
        { text: 'Scene', link: '/scene/scene' },
        { text: 'Node', link: '/scene/node' },
        { text: 'Container', link: '/scene/container' },
        { text: 'MeshNode', link: '/scene/mesh' },
        { text: 'Skeleton', link: '/scene/skeleton' }
      ]},
       { text: 'Loader', items: [
        { text: 'GLB Loader', link: '/loader/glbLoader' },
        { text: 'Texture Loader', link: '/loader/texLoader' },
        { text: 'Other Loader', link: '/loader/otherLoader' },
       ]},
      { text: 'Animation', items: [
        { text: 'Timeline', link: '/animation/timeline' },
      ]},
      { text: 'Math3D', link: '/math3d' },
      { text: 'Inspector', link: '/inspector' }
    ],
    search: { provider: 'local' },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/JoyFul721/Vapor3D' }
    ]
  }
})
