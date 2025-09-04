interface FloatingButtonProps {
  onClick: () => void;
}

const FloatingButton = ({ onClick }: FloatingButtonProps) => (
  <button
    onClick={onClick}
    className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-600 border border-black"
  >
    <i className="bi bi-pencil-square"></i>
  </button>
);

export default FloatingButton;