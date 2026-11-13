import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { CanvasTexture, SRGBColorSpace } from "three";
import type { Mesh } from "three";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Heart,
  Rotate3D,
  Sparkles,
  Star,
  X,
} from "lucide-react";

const memories = [
  {
    title: "Tu luz",
    text: "Desde que llegaste, haces que los días comunes se sientan extraordinarios. Tu manera de sonreír cambia el mundo de quienes te rodean.",
    images: ["/luz.jpeg", "/luz1.jpeg"],
    alt: "Fotografía de la estrella Tu luz",
    position: "center 30%",
    star: { left: "7%", top: "24%", size: "lg" },
  },
  {
    title: "Tus aventuras",
    text: "Que nunca te falten caminos por descubrir, canciones por cantar y personas bonitas con quienes compartir el viaje.",
    images: ["/aventura.jpeg", "/aventura2.jpeg"],
    alt: "Fotografía de la estrella Tus aventuras",
    position: "center",
    star: { left: "82%", top: "18%", size: "md" },
  },
  {
    title: "A tu lado",
    text: "En cada foto queda guardado un momento especial y todo el cariño que nos une. Gracias por compartir la vida con nosotros y llenar nuestra historia de recuerdos que siempre llevaremos en el corazón.",
    images: ["/personas1.jpeg", "/personas2.jpeg"],
    alt: "Fotografía de la estrella A tu lado",
    position: "center",
    star: { left: "91%", top: "53%", size: "lg" },
  },
  {
    title: "Tu esencia",
    text: "Sigue siendo auténtica, curiosa y valiente. No existe nadie más en el universo que brille exactamente como tú.",
    images: ["/esencia2.jpeg", "/esencia3.jpeg"],
    alt: "Fotografía de la estrella Tu esencia",
    position: "center 38%",
    star: { left: "78%", top: "83%", size: "md" },
  },
  {
    title: "Tu alegría",
    text: "Deseamos que conserves siempre esa risa que contagia, esa energía que abraza y esa forma tuya de volver especial cada momento.",
    images: ["/alegria.jpeg"],
    alt: "Fotografía de la estrella Tu alegría",
    position: "center",
    star: { left: "15%", top: "78%", size: "sm" },
  },
  {
    title: "Lo que viene",
    text: "Este es apenas el comienzo. Tus sueños ya te están esperando y sabemos que llegarás tan lejos como quieras imaginar.",
    images: ["/viene1.jpeg", "/viene2.jpeg"],
    alt: "Fotografía de la estrella Lo que viene",
    position: "center 34%",
    star: { left: "4%", top: "50%", size: "md" },
  },
];

const tinyStars = Array.from({ length: 90 }, (_, index) => ({
  left: `${(index * 47 + 11) % 100}%`,
  top: `${(index * 71 + 7) % 100}%`,
  size: index % 9 === 0 ? 2 : index % 4 === 0 ? 1.5 : 1,
  delay: `${(index % 12) * 0.28}s`,
  opacity: 0.22 + (index % 6) * 0.11,
}));

function Earth() {
  const earth = useRef<Mesh>(null);
  const atmosphere = useRef<Mesh>(null);
  const sourceTexture = useTexture("/mundo.png");
  const texture = useMemo(() => {
    const image = sourceTexture.image;
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar la textura del planeta.");

    const background = context.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
    );
    background.addColorStop(0, "#15304d");
    background.addColorStop(0.58, "#28144c");
    background.addColorStop(1, "#080b1c");
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const planetTexture = new CanvasTexture(canvas);
    planetTexture.colorSpace = SRGBColorSpace;
    return planetTexture;
  }, [sourceTexture]);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((_, delta) => {
    if (earth.current) earth.current.rotation.y += delta * 0.045;
    if (atmosphere.current) atmosphere.current.rotation.y -= delta * 0.018;
  });

  return (
    <group rotation={[0.12, -0.35, -0.08]}>
      <mesh ref={earth} castShadow receiveShadow>
        <sphereGeometry args={[1, 96, 96]} />
        <meshStandardMaterial map={texture} roughness={0.72} metalness={0.03} />
      </mesh>
      <mesh ref={atmosphere} scale={1.035}>
        <sphereGeometry args={[1, 96, 96]} />
        <meshPhongMaterial
          color="#76ceff"
          transparent
          opacity={0.13}
          shininess={90}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function Planet3D() {
  return (
    <div
      className="earth-canvas h-full w-full cursor-grab active:cursor-grabbing"
      role="img"
      aria-label="Planeta ilustrado tridimensional. Arrastra para rotarlo."
    >
      <Canvas
        camera={{ position: [0, 0, 3.15], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.34} />
        <directionalLight position={[-3, 2.5, 4]} intensity={3.6} color="#dff7ff" />
        <directionalLight position={[4, -1, -3]} intensity={0.7} color="#667cff" />
        <pointLight position={[-3, -2, 1]} intensity={0.55} color="#a85fff" />
        <Suspense fallback={null}>
          <Earth />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          rotateSpeed={0.65}
          dampingFactor={0.06}
          enableDamping
        />
      </Canvas>
    </div>
  );
}

function App() {
  const [selectedMemory, setSelectedMemory] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    document.body.style.overflow = selectedMemory !== null || !entered ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedMemory, entered]);

  useEffect(() => {
    if (selectedMemory === null) return;
    const imageCount = memories[selectedMemory].images.length;
    if (imageCount < 2) return;

    const intervalId = window.setInterval(() => {
      setSelectedImageIndex((currentIndex) => (currentIndex + 1) % imageCount);
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [selectedMemory]);

  const openMemory = (index: number) => {
    setSelectedImageIndex(0);
    setSelectedMemory(index);
  };

  const openAdjacent = (direction: number) => {
    if (selectedMemory === null) return;
    setSelectedImageIndex(0);
    setSelectedMemory((selectedMemory + direction + memories.length) % memories.length);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#050713] text-white">
      <div className="fixed inset-0 pointer-events-none">
        {tinyStars.map((star, index) => (
          <span
            key={index}
            className="tiny-star absolute rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      <header className="fixed inset-x-0 top-0 z-40">
        <nav className="mx-auto flex max-w-[1500px] justify-end px-5 py-5 md:px-10 md:py-7 lg:px-16">
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#0b1024]/65 px-4 py-2.5 backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#cda4ff] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#cda4ff]" />
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[.22em] text-white/65">
              6 estrellas por descubrir
            </span>
          </div>
        </nav>
      </header>

      <section id="universo" className="relative min-h-[840px] lg:h-screen lg:min-h-[760px]">
        <div className="nebula nebula-one" />
        <div className="nebula nebula-two" />

        <div className="relative z-10 mx-auto grid min-h-[840px] max-w-[1500px] items-center gap-8 px-5 pb-16 pt-28 lg:h-screen lg:min-h-[760px] lg:grid-cols-[.8fr_1.2fr] lg:px-16 lg:pb-8 lg:pt-24">
          <div className="relative z-20 max-w-xl lg:pb-10">
            <h1 className="font-display text-[clamp(3.3rem,8vw,6.6rem)] leading-[.82] tracking-[-.055em]">
              Hoy es un
              <span className="mt-3 block bg-gradient-to-r from-[#9fe8ff] via-[#d4b2ff] to-[#ffb6d9] bg-clip-text italic text-transparent">
                día especial
              </span>
            </h1>
            <p className="mt-8 max-w-md text-sm leading-7 text-[#a9aec9] md:text-base">
              Claudia, en tus 16 vueltas al sol has llenado nuestra vida de luz.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[.04] px-4 py-3">
                <Rotate3D size={16} className="text-[#89ddff]" />
                <span className="text-[9px] font-semibold uppercase tracking-[.18em] text-white/60">
                  Arrastra el planeta
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[.04] px-4 py-3">
                <Star size={15} className="fill-[#d9b4ff] text-[#d9b4ff]" />
                <span className="text-[9px] font-semibold uppercase tracking-[.18em] text-white/60">
                  Toca las estrellas
                </span>
              </div>
            </div>
          </div>

          <div className="universe-stage relative mx-auto aspect-square w-full max-w-[700px] select-none">
            <div className="orbit-ring orbit-ring-one" />
            <div className="orbit-ring orbit-ring-two" />
            <div className="orbit-ring orbit-ring-three" />

            {memories.map((memory, index) => (
              <button
                key={memory.title}
                onClick={() => openMemory(index)}
                className={`memory-star memory-star-${memory.star.size} group absolute z-30`}
                style={{ left: memory.star.left, top: memory.star.top }}
                aria-label={`Abrir recuerdo: ${memory.title}`}
              >
                <span className="star-pulse absolute inset-0 rounded-full bg-[#d2b0ff]/30" />
                <span className="relative flex h-full w-full items-center justify-center rounded-full border border-[#d8b7ff]/50 bg-[#111735]/80 text-[#e5ccff] shadow-[0_0_25px_rgba(203,160,255,.45)] backdrop-blur-md transition duration-300 group-hover:scale-125 group-hover:bg-[#d5b5ff] group-hover:text-[#171027]">
                  <Star className="fill-current" size={14} strokeWidth={1.5} />
                </span>
                <span className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] -translate-x-1/2 whitespace-nowrap text-[8px] font-bold uppercase tracking-[.2em] text-white/0 transition group-hover:text-white/70">
                  {memory.title}
                </span>
              </button>
            ))}

            <div className="absolute inset-[18%] z-20 flex items-center justify-center md:inset-[20%]">
              <div className="planet-glow absolute inset-[-14%] rounded-full" />
              <Planet3D />
            </div>
          </div>
        </div>

        <a
          href="#mensaje"
          className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-[8px] font-semibold uppercase tracking-[.25em] text-white/35 lg:flex"
        >
          Sigue explorando
          <ArrowDown size={16} className="animate-bounce" />
        </a>
      </section>

      <section
        id="mensaje"
        className="relative border-t border-white/[.07] px-5 py-28 md:px-10 md:py-36 lg:px-16"
      >
        <div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#c09aff]/50 to-transparent" />
        <div className="mx-auto max-w-5xl text-center">
          <Sparkles size={28} className="mx-auto mb-9 text-[#c4a0ff]" strokeWidth={1.3} />
          <p className="mb-6 text-[10px] font-bold uppercase tracking-[.36em] text-[#a9b6eb]">
            Una carta desde nuestro planeta
          </p>
          <h2 className="font-display text-5xl leading-[.95] tracking-[-.04em] text-white md:text-8xl">
            El mundo es más bonito
            <em className="block bg-gradient-to-r from-[#80deff] to-[#e6aeff] bg-clip-text text-transparent">
              porque tú estás en él
            </em>
          </h2>
          <div className="mx-auto mt-12 max-w-2xl border-l border-[#bd9cfa]/40 pl-6 text-left md:pl-10">
            <p className="font-display text-2xl leading-relaxed text-[#d8d9e8] md:text-3xl">
              “Cumplir 16 no es solo sumar un año; es abrir una puerta a nuevas versiones de ti,
              nuevos sueños y nuevas historias.”
            </p>
            <p className="mt-7 text-sm leading-7 text-[#888faa]">
              Deseamos que explores cada una sin miedo, que te equivoques, que vuelvas a intentarlo
              y que nunca olvides mirar hacia arriba. Siempre habrá una estrella recordándote que
              eres profundamente amada.
            </p>
          </div>
          <div className="mt-16 flex items-center justify-center gap-4">
            <span className="h-px w-14 bg-white/15" />
            <Heart className="fill-[#df9dcc] text-[#df9dcc]" size={16} />
            <p className="text-[9px] font-bold uppercase tracking-[.26em] text-white/45">
              Feliz vuelta número dieciséis
            </p>
            <span className="h-px w-14 bg-white/15" />
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/[.06] px-6 py-8">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-display text-xl italic">Para Claudia, con todo nuestro amor.</p>
          <p className="text-[8px] uppercase tracking-[.28em] text-white/30">
            16 vueltas al sol · infinitas por descubrir
          </p>
        </div>
      </footer>

      {!entered && (
        <div className="intro-screen fixed inset-0 z-[100] flex items-center justify-center bg-[#040510] px-6 text-center">
          <div className="intro-orbit absolute h-[420px] w-[420px] rounded-full border border-[#a981df]/15 md:h-[650px] md:w-[650px]" />
          <div className="relative max-w-xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[.4em] text-[#a9afd6] md:text-sm">
              Feliz cumpleaños
            </p>
            <h2 className="font-display text-6xl tracking-[-.04em] md:text-8xl">Claudia</h2>
            <p className="mx-auto mt-6 max-w-sm text-sm leading-6 text-white/50">
              Hay un universo entero esperando que lo descubras.
            </p>
            <button
              onClick={() => setEntered(true)}
              className="group mx-auto mt-10 flex items-center gap-5 rounded-full border border-[#c6a1ff]/30 bg-[#c6a1ff]/10 py-2 pl-7 pr-2 text-[9px] font-bold uppercase tracking-[.24em] text-white transition hover:bg-[#c5a0ff] hover:text-[#10091c]"
            >
              Entrar a mi universo
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#25113c] transition group-hover:translate-x-1">
                <ArrowRight size={17} />
              </span>
            </button>
          </div>
        </div>
      )}

      {selectedMemory !== null && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-[#02030a]/85 p-0 backdrop-blur-xl md:items-center md:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="memory-title"
        >
          <div className="memory-modal relative grid max-h-[94vh] w-full max-w-5xl overflow-y-auto border border-white/10 bg-[#0c1023] md:max-h-[760px] md:grid-cols-[1.08fr_.92fr]">
            <div className="relative min-h-[42vh] overflow-hidden md:min-h-[680px]">
              <img
                key={memories[selectedMemory].images[selectedImageIndex]}
                src={memories[selectedMemory].images[selectedImageIndex]}
                alt={memories[selectedMemory].alt}
                className="memory-image absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: memories[selectedMemory].position }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080b1b]/55 via-transparent to-[#080b1b]/10" />
            </div>
            <div className="relative flex flex-col justify-between p-7 md:p-12">
              <button
                onClick={() => setSelectedMemory(null)}
                aria-label="Cerrar recuerdo"
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:bg-white hover:text-[#111426]"
              >
                <X size={17} />
              </button>
              <div className="pt-12 md:pt-20">
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-full bg-[#b992f0]/15 text-[#d6b8ff]">
                  <Star className="fill-current" size={16} />
                </div>
                <h2 id="memory-title" className="font-display text-5xl md:text-6xl">
                  {memories[selectedMemory].title}
                </h2>
                <p className="mt-7 text-sm leading-7 text-[#a8adc4]">
                  {memories[selectedMemory].text}
                </p>
              </div>
              <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">
                <button
                  onClick={() => openAdjacent(-1)}
                  className="flex items-center gap-3 text-[8px] font-bold uppercase tracking-[.22em] text-white/45 transition hover:text-white"
                >
                  <ArrowLeft size={16} /> Anterior
                </button>
                <div className="flex gap-1.5">
                  {memories.map((_, index) => (
                    <span
                      key={index}
                      className={`h-1 rounded-full transition-all ${index === selectedMemory ? "w-6 bg-[#d0afff]" : "w-1 bg-white/20"}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => openAdjacent(1)}
                  className="flex items-center gap-3 text-[8px] font-bold uppercase tracking-[.22em] text-white/45 transition hover:text-white"
                >
                  Siguiente <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
