export function Scene() {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded border">
      <img src="/assets/scenes/sky.png" className="absolute inset-0 h-full w-full object-cover" />
      <img src="/assets/scenes/ground.png" className="absolute bottom-0 h-24 w-full object-cover" />
    </div>
  );
}
