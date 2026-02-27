// src/components/LayoutPreviewGrid.tsx
interface Props {
  desks: any[];
}

const LayoutPreviewGrid = ({ desks }: Props) => {
  return (
    <div className="relative w-full h-[150px] border bg-gray-50 overflow-hidden">
      {desks.map((d) => (
        <div
          key={d.id}
          className="absolute bg-blue-500 rounded"
          style={{
            left: d.x / 4,
            top: d.y / 4,
            width: d.width / 4,
            height: d.height / 4,
          }}
        />
      ))}
    </div>
  );
};

export default LayoutPreviewGrid;