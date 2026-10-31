
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
        { text: 'Loader', link: '/scene/loader' }
      ]},
      { text: 'Animation', items: [
        { text: 'Timeline', link: '/animation/timeline' },
        { text: 'Mixer', link: '/animation/mixer' }
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
