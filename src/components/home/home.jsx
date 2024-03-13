import "./home.css";

export default function Home() {
  return (
    <div className="Home">
      <video id="background-video" autoPlay loop muted>
        <source src="/1105629993-preview.mp4" type="video/mp4" />
      </video>
      <h1 className="Home-header">
        bin.kgp<span>&nbsp;</span>
      </h1>
      <div className="Home-tagline">
        <span>&nbsp;</span>
        <span>A swiss-army knife for boolean expressions</span>
      </div>
    </div>
  );
}
