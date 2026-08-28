// import Image from "next/image";

// const navLinks = [
//   { label: "الكتالوج", href: "#" },
//   { label: "المفضلة", href: "#" },
//   { label: "من نحن", href: "#" },
//   { label: "الرئيسية", href: "#" },
// ];

// export default function HeroSecond() {
//   return (
    
    
//     <section className="hero-second relative w-full h-screen overflow-hidden bg-second text-primary">
//       <div className=" container mx-auto">
//         <nav className="relative z-20 flex items-center justify-between px-6 py-3 md:px-12">
//           <ul className="hidden gap-8 text-md font-medium tracking-wide md:flex">
//             {navLinks.map((link) => (
//               <li key={link.label}>
//                 <a
//                   href={link.href}
//                   className="transition-colors hover:text-accent font-sans"
//                 >
//                   {link.label}
//                 </a>
//               </li>
//             ))}
//           </ul>
//           <div className="flex items-center gap-4 text-primary ">
//             <Image src="/erer.png" alt="aslfldf" width={35} height={35} />
//           </div>
//         </nav>


//         <div className="relative mx-auto grid max-w-350 grid-cols-1 px-6 pb-16 md:grid-cols-12 md:gap-6 md:px-12">
//           <h1
//             aria-hidden="true"
//             className="pointer-events-none font-sans absolute inset-0  -top-10   col-span-full  select-none text-center font-black leading-[0.85]  text-[clamp(3.2rem,8vw,9.5rem)] md:-mb-10"
//           >
//             <span className="block">
//               مجو<span className="">هرات </span>در
//             </span>
//           </h1>

//           {/* #8b6c8d #f4f0eb */}
//           <div className="absolute inset-0 top-88 z-10 flex items-center justify-center drop-shadow-2xl">
//             <Image
//               src="/logo_removed.png"
//               alt="asjh jdsbvds "
//               width={450}
//               height={450}
//             />
//           </div>
//         </div>
//       </div>
//     </section>
   
//   );
// }

// "use client";

// import { Menu, ArrowLeft } from "lucide-react";
// import Image from "next/image";
// import { motion } from "framer-motion";
// import Preloader from "./Preloader";
// import { useState } from "react";

// export default function HeroSection() {
//   const [isLoading, setIsLoading] = useState(true);
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.15,
//         delayChildren: 0.2,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
//     },
//   };

//   return (
//     <>
//       <Preloader onComplete={() => setIsLoading(false)} />
//       <section
//         dir="rtl"
//         className="relative min-h-screen w-full overflow-hidden bg-linear-to-tl from-[#ede8d5] via-[#c5bbb0] to-[#b3a89c] font-sans flex flex-col justify-between"
//       >
//         {/* 1. إضاءة ناعمة بالمنتصف */}
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18)_0%,transparent_70%)] pointer-events-none z-0" />

//         {/* 2. الهيدر واللوغو الكبير */}
//         <div className="max-w-7xl mx-auto w-full z-10 relative">
//           <header className="w-full px-8 py-5 flex items-center justify-between">
//             <div className="flex items-center gap-5">
//               <Image src="/erer.png" alt="logo icon" width={25} height={20} />
//             </div>

//             <button className="flex items-center gap-2 text-md tracking-wider uppercase hover:opacity-80 transition-opacity text-primary cursor-pointer">
//               <span className="font-normal">Menu</span>
//               <Menu size={20} strokeWidth={1.5} />
//             </button>
//           </header>

//           {/* اللوغو الكبير (DUR JEWELRY) مع أنيميشن ظهور من الأعلى */}
//           <motion.div
//             initial={{ opacity: 0, y: -30 }}
//             animate={!isLoading ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
//             transition={{ duration: 1, ease: "easeOut" }}
//             className="w-full px-4 text-center border-y border-white/40 py-1"
//           >
//             <h1 className="text-[10vw] leading-none font-serif tracking-widest text-white/95 uppercase select-none drop-shadow-sm font-bold">
//               DUR JEWELRY
//             </h1>
//           </motion.div>
//         </div>

//         {/* 3. شبكة المحتوى وتوزيع النصوص الجانبية */}
//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           animate={!isLoading ? "visible" : "hidden"}
//           className="max-w-7xl mx-auto w-full px-8 z-10 relative my-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-end pb-16"
//         >
//           {/* --- اليمين (في RTL): مجموعة دُرّ + الوصف + الزر --- */}
//           <motion.div variants={itemVariants} className="space-y-6 max-w-sm">
//             <motion.h2
//               variants={itemVariants}
//               className="text-4xl font-sans uppercase text-white drop-shadow-2xl"
//             >
//               مجوهرات دُرّ 
//             </motion.h2>

//             <motion.p
//               variants={itemVariants}
//               className="text-xs md:text-sm text-white/85 font-sans leading-relaxed font-light"
//             >
//               اكتشفي مجوهرات فاخرة مستوحاة من سحر السماء. صيغت كل قطعة ببراعة
//               لتضفي لمسة من الأناقة والجمال على أثمن لحظاتك.
//             </motion.p>

//             <motion.button
//               variants={itemVariants}
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               className="flex items-center font-sans gap-3 bg-primary text-second px-7 py-3 rounded-full text-[14px] hover:bg-primary/90  cursor-pointer shadow-lg"
//             >
//               <span>استكشفي الآن</span>
//               <ArrowLeft size={14} />
//             </motion.button>
//           </motion.div>

//           {/* --- اليسار (في RTL): العبارة العلوية + القائمة السفلية --- */}
//           <motion.div
//             variants={itemVariants}
//             className="flex flex-col items-start justify-between space-y-10 text-right md:text-left w-full md:items-end"
//           >
//             {/* العبارة العلوية */}
//             <motion.p
//               variants={itemVariants}
//               className="text-xs md:text-[18px] tracking-widest uppercase text-white max-w-xs leading-relaxed text-right font-sans"
//             >
//               لمسة سماوية <br />
//               لحظات خالدة لا تُنسى
//             </motion.p>

//             {/* قائمة المنتجات */}
//             <motion.div
//               variants={itemVariants}
//               className="w-full max-w-xs space-y-2 pt-3 border-t border-white/20"
//             >
//               {[
//                 { title: "خواتم", href: "#rings" },
//                 { title: "أقراط", href: "#earrings" },
//                 { title: "قلائد", href: "#necklaces" },
//                 { title: "أساور", href: "#bracelets" },
//               ].map((item, index) => (
//                 <a
//                   key={index}
//                   href={item.href}
//                   className="flex items-center justify-between py-1.5 text-md tracking-wider text-white/90 hover:text-primary border-b border-white/20 hover:border-primary transition-all group"
//                 >
//                   <span>{item.title}</span>
//                   <ArrowLeft
//                     size={16}
//                     className="opacity-70 group-hover:-translate-x-1.5 transition-transform"
//                   />
//                 </a>
//               ))}
//             </motion.div>
//           </motion.div>
//         </motion.div>

//         {/* 4. صورة اليد بالمنتصف مع انيميشن صعود فخم ورقيق */}
//         <motion.div
//           initial={{ opacity: 0, y: 80 }}
//           animate={!isLoading ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
//           transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
//           className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg md:max-w-xl lg:max-w-2xl pointer-events-none flex justify-center items-end"
//         >
//           <Image
//             src="/gnyrm.png"
//             alt="DUR Jewelry Hand"
//             width={1300}
//             height={1000}
//             priority
//             className="object-contain max-h-[76vh] w-auto drop-shadow-2xl"
//           />
//         </motion.div>
//       </section>
//     </>
//   );
// } 


// "use client";

// import { Menu, ArrowRight } from "lucide-react";
// import Image from "next/image";
// import { motion } from "framer-motion";
// import Preloader from "./Preloader";
// import { useState } from "react";

// export default function HeroSectionEN() {
//   const [isLoading, setIsLoading] = useState(true);

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.15,
//         delayChildren: 0.2,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
//     },
//   };

//   return (
//     <>
//       <Preloader onComplete={() => setIsLoading(false)} />
//       <section
//         dir="ltr"
//         className="relative min-h-screen w-full overflow-hidden bg-linear-to-tl from-[#ede8d5] via-[#c5bbb0] to-[#b3a89c] font-sans flex flex-col justify-between"
//       >
//         {/* 1. Subtle Center Radial Lighting */}
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18)_0%,transparent_70%)] pointer-events-none z-0" />

//         {/* 2. Header & Main Big Brand Title */}
//         <div className="max-w-7xl mx-auto w-full z-10 relative">
//           <header className="w-full px-8 py-5 flex items-center justify-between">
//             <div className="flex items-center gap-5">
//               <Image src="/erer.png" alt="logo icon" width={25} height={20} />
//             </div>

//             <button className="flex items-center gap-2 text-md tracking-wider uppercase hover:opacity-80 transition-opacity text-primary cursor-pointer">
//               <span className="font-normal">Menu</span>
//               <Menu size={20} strokeWidth={1.5} />
//             </button>
//           </header>

//           {/* Big Brand Title (DUR JEWELRY) */}
//           <motion.div
//             initial={{ opacity: 0, y: -30 }}
//             animate={!isLoading ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
//             transition={{ duration: 1, ease: "easeOut" }}
//             className="w-full px-4 text-center border-y border-white/40 py-1"
//           >
//             <h1 className="text-[10vw] leading-none font-serif tracking-widest text-white/95 uppercase select-none drop-shadow-sm font-bold">
//               DUR JEWELRY
//             </h1>
//           </motion.div>
//         </div>

//         {/* 3. Content Grid & Side Typography */}
//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           animate={!isLoading ? "visible" : "hidden"}
//           className="max-w-7xl mx-auto w-full px-8 z-10 relative my-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-end pb-16"
//         >
//           {/* --- Left Column (In LTR): Collection Title + Description + CTA Button --- */}
//           <motion.div variants={itemVariants} className="space-y-6 max-w-sm">
//             <motion.h2
//               variants={itemVariants}
//               className="text-4xl font-sans uppercase text-white drop-shadow-2xl"
//             >
//               DUR COLLECTION
//             </motion.h2>

//             <motion.p
//               variants={itemVariants}
//               className="text-xs md:text-sm text-white/85 font-sans leading-relaxed font-light"
//             >
//               Discover high-end jewelry inspired by celestial elegance. Every
//               piece is meticulously crafted to add timeless sophistication to
//               your most cherished moments.
//             </motion.p>

//             <motion.button
//               variants={itemVariants}
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               className="flex items-center font-sans gap-3 bg-primary text-second px-7 py-3 rounded-full text-[14px] hover:bg-primary/90 cursor-pointer shadow-lg"
//             >
//               <span>EXPLORE NOW</span>
//               <ArrowRight size={14} />
//             </motion.button>
//           </motion.div>

//           {/* --- Right Column (In LTR): Tagline + Categories Navigation --- */}
//           <motion.div
//             variants={itemVariants}
//             className="flex flex-col items-start justify-between space-y-10 text-left w-full md:items-end"
//           >
//             {/* Upper Tagline */}
//             <motion.p
//               variants={itemVariants}
//               className="text-xs md:text-[18px] tracking-widest uppercase text-white max-w-xs leading-relaxed text-left md:text-right font-sans"
//             >
//               A Celestial Touch <br />
//               Unforgettable Timeless Moments
//             </motion.p>

//             {/* Product Navigation List */}
//             <motion.div
//               variants={itemVariants}
//               className="w-full max-w-xs space-y-2 pt-3 border-t border-white/20"
//             >
//               {[
//                 { title: "RINGS", href: "#rings" },
//                 { title: "EARRINGS", href: "#earrings" },
//                 { title: "NECKLACES", href: "#necklaces" },
//                 { title: "BRACELETS", href: "#bracelets" },
//               ].map((item, index) => (
//                 <a
//                   key={index}
//                   href={item.href}
//                   className="flex items-center justify-between py-1.5 text-md tracking-wider text-white/90 hover:text-primary border-b border-white/20 hover:border-primary transition-all group"
//                 >
//                   <span>{item.title}</span>
//                   <ArrowRight
//                     size={16}
//                     className="opacity-70 group-hover:translate-x-1.5 transition-transform"
//                   />
//                 </a>
//               ))}
//             </motion.div>
//           </motion.div>
//         </motion.div>

//         {/* 4. Center Product / Hand Showcase Image */}
//         <motion.div
//           initial={{ opacity: 0, y: 80 }}
//           animate={!isLoading ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
//           transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
//           className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg md:max-w-xl lg:max-w-2xl pointer-events-none flex justify-center items-end"
//         >
//           <Image
//             src="/gnyrm.png"
//             alt="DUR Jewelry Hand Showcase"
//             width={1300}
//             height={1000}
//             priority
//             className="object-contain max-h-[76vh] w-auto drop-shadow-2xl"
//           />
//         </motion.div>
//       </section>
//     </>
//   );
// }