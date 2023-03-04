import { useNavigate } from "react-router-dom";
import { AiOutlineMessage } from "react-icons/ai";

const Message = () => {
  const navigate  = useNavigate();
  return (
    <button
      className={`text-2xl md:text-3xl w-12 h-12 rounded-full text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none flex items-center justify-center`}
      onClick={() => navigate('/message')}
    >
        <AiOutlineMessage size={22}/>
    </button>
  );
};

export default Message;
