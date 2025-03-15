import { motion } from "framer-motion";

const SuccessMessage = ({
  message,
  isError,
}: {
  message: string;
  isError: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex items-center gap-10 p-4 rounded-lg shadow-md ${
        isError ? "bg-red-100 border border-red-300" : "bg-green-100 border border-green-300"
      }`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ duration: 0.4, type: "spring" }}
      >
        <div className="svg-container">
          <svg
            className={`ft-${isError ? "red" : "green"}-tick`}
            xmlns="http://www.w3.org/2000/svg"
            height="100"
            width="100"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <circle
              className="circle"
              fill={isError ? "#e53e3e" : "#5bb543"}
              cx="24"
              cy="24"
              r="22"
            />
            <path
              className="tick"
              fill="none"
              stroke="#FFF"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeMiterlimit="10"
              d={isError ? "M14 14L34 34M34 14L14 34" : "M14 27l5.917 4.917L34 17"}
            />
          </svg>
        </div>
      </motion.div>
      <p className={`font-bold text-based ${isError ? "text-red-700" : "text-green-700"}`}>
        {message}
      </p>
    </motion.div>
  );
};

export default SuccessMessage;