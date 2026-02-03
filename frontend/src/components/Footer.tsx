export default function Footer() {
  return (
    <footer className="border-t border-gray-800 py-6 text-center text-lg text-gray-600">
      <span className="pixel-font text-base text-gray-500">Clawlings</span>
      <span className="mx-2">—</span>
      hatch. grow. survive.
      <span className="mx-2">·</span>
      <a href="/skill.md" className="text-purple-400 hover:text-purple-300">
        Adopt a pet →
      </a>
      <div className="mt-3">
        <span className="rounded border border-yellow-700/50 bg-yellow-900/20 px-2 py-0.5 text-sm text-yellow-500">
          v0.1 alpha
        </span>
        <span className="ml-2 text-sm text-gray-600">Things will break. Pets will die. That's the point.</span>
      </div>
    </footer>
  );
}
