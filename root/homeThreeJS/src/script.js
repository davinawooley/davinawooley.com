import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { gsap } from 'gsap'



// Loaders
const loadingBarElement = document.querySelector('.loading-bar')
const loadingManager = new THREE.LoadingManager(
    () =>
    {

        window.setTimeout(() =>
        {

            gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 , delay: 1})
            loadingBarElement.classList.add('ended')
            loadingBarElement.style.transform = ''

        }, 500)
    },

    // Progress
    (itemUrl, itemsLoaded, itemsTotal) =>
    {
        // console.log(itemUrl, itemsLoaded, itemsTotal)
        const progressRatio = itemsLoaded / itemsTotal
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
    }

)
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)


/**
 * Base
 */
// Debug
const debugObject = {}
// const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// overlay
const overlayGeomeometry = new THREE.PlaneBufferGeometry(2,2,1,1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent : true,
    uniforms: {
        uAlpha:{value:1}
    },
    vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;
        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);

            
        }
    `
})
const overlay = new THREE.Mesh(overlayGeomeometry, overlayMaterial)
scene.add(overlay)

// update all materials

const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
            
       

            child.geometry.computeBoundingBox();
            child.geometry.boundingBox.expandByScalar(2);

        }
    })
}




// environment map
const environmentMap = cubeTextureLoader.load(['../ ../images/dew.jpg',
'/textures/environmentMaps/0/nx.jpg',
'/textures/environmentMaps/0/py.jpg',
'/textures/environmentMaps/0/ny.jpg',
'/textures/environmentMaps/0/pz.jpg',
'/textures/environmentMaps/0/nz.jpg'
])

environmentMap.encoding = THREE.sRGBEncoding

scene.background = environmentMap
scene.environment = environmentMap

debugObject.envMapIntensity = 2.5

/**
 * Models
 */


let mixer = null


gltfLoader.load(
    '/models/dewModel.glb',
    (gltf) =>
    {

        gltf.scene.rotation.min = (-Math.PI/2)
        gltf.scene.rotation.max = (Math.PI/2)
        gltf.scene.scale.set(0.35, 0.35, 0.35)
        gltf.scene.rotation.y = Math.PI*.5
        gltf.scene.position.set(-5, - 4, 0)

        scene.add(gltf.scene)
        let gltfModel = gltf.scene
        gltfModel.traverse(function(obj) { obj.frustumCulled = false; });
        // setModel(gltfModel)
       

        updateAllMaterials()
    }
)


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xf4f4f4, 2)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xf4f4f4, 3)

directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(- 5, 5, 0)
scene.add(directionalLight)






/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
   
    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)

camera.position.set(5, 4, 5)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.minAzimuthAngle =.5; 
controls.maxAzimuthAngle = Math.PI*5; 
controls.target.set(0, 0, 0)
controls.enableDamping = true 

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas, 
    antialias: true
})

renderer.shadowMap.enabled = true
renderer.physicallyCorrectLights = true
renderer.shadowMap.type = THREE .PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding
renderer.physicallyCorrectLights = true
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 2




/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Model animation
    if(mixer)
    {
        mixer.update(deltaTime)
    }

    // Update controls
    controls.update()


    renderer.render(scene, camera)


    window.requestAnimationFrame(tick)
}

tick()