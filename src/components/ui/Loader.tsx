import { motion } from "framer-motion";

interface LoaderProps {
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = "Chargement en cours..." }) => {
  return (
    <div className="flex flex-col justify-center items-center py-6 space-y-3">
      {/* ✅ Animation du cercle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-10 h-10 border-4 border-teal-500 border-solid border-t-transparent rounded-full"
      ></motion.div>

      {/* ✅ Animation du texte */}
      <motion.p
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="text-teal-600 text-sm font-medium"
      >
        {message}
      </motion.p>
    </div>
  );
};

export default Loader;