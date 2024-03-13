import "./about.css";

export default function About() {
  return (
    <div className="about">
      <div className="about-header">
        <h1>
          <span>About</span>
        </h1>
        <div className="about-rules">Fun project, developed by</div>
      </div>
      <div className="about-body">
        <div>
          <img className="about-image" src="/quasar.jpg" alt="Quasar" />
        </div>
        <div className="about-details">
          Quasar
          <br />
          Student of Department of Electronics & Electrical Communication
          Engineering
          <br />
          Indian Institute of Technology Kharagpur
        </div>
      </div>
    </div>
  );
}
