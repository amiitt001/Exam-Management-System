import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
    const MountRef = useRef(null);

    useEffect(() => {
        const currentMount = MountRef.current;
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        currentMount.appendChild(renderer.domElement);

        // Geometries
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 1500;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 10;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        // Materials
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.005,
            color: 0x00e5c3, // Teal accent
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const mainObjectGeometry = new THREE.IcosahedronGeometry(2, 2);
        const mainObjectMaterial = new THREE.MeshBasicMaterial({
            color: 0x00e5c3,
            wireframe: true,
            transparent: true,
            opacity: 0.08
        });

        // Meshes
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        const mainObject = new THREE.Mesh(mainObjectGeometry, mainObjectMaterial);
        scene.add(particlesMesh, mainObject);

        camera.position.z = 5;

        // Interaction
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (event) => {
            mouseX = event.clientX / window.innerWidth - 0.5;
            mouseY = event.clientY / window.innerHeight - 0.5;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Animation
        const animate = () => {
            requestAnimationFrame(animate);

            mainObject.rotation.y += 0.002;
            mainObject.rotation.x += 0.001;

            particlesMesh.rotation.y += 0.0005;

            // Mouse Parallax Logic
            particlesMesh.position.x += (mouseX * 0.5 - particlesMesh.position.x) * 0.05;
            particlesMesh.position.y += (-mouseY * 0.5 - particlesMesh.position.y) * 0.05;

            mainObject.position.x += (mouseX * 0.2 - mainObject.position.x) * 0.05;
            mainObject.position.y += (-mouseY * 0.2 - mainObject.position.y) * 0.05;

            renderer.render(scene, camera);
        };

        animate();

        // Resize handler
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (currentMount) {
                currentMount.removeChild(renderer.domElement);
            }
            particlesGeometry.dispose();
            particlesMaterial.dispose();
            mainObjectGeometry.dispose();
            mainObjectMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    return <div ref={MountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }} />;
};

export default ThreeBackground;
