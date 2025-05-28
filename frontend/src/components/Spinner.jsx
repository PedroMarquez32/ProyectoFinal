import { motion } from "framer-motion";

const Spinner = ({ fullScreen = false }) => (
  <div className={`flex items-center justify-center ${fullScreen ? "min-h-screen" : "h-32"}`}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="rounded-full h-14 w-14 border-t-4 border-b-4 border-[#4DA8DA] border-solid"
      style={{ borderLeft: "4px solid transparent", borderRight: "4px solid transparent" }}
    />
  </div>
);

export default Spinner;