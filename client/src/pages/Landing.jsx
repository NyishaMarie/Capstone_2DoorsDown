import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiRequest from '../api/Services/Api';
import ToolCard from '../components/ToolCard';

export default function Landing() {
  const [tools, setTools] = useState([]);
  const [status, setStatus] = useState('loading');

  // Featured tools are just the first few from the public catalog —
  // no auth needed, same endpoint Browse.jsx uses.
  useEffect(() => {
    apiRequest('/tools')
      .then(data => {
        setTools(data.slice(0, 3));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-hero__copy">
          <h1 className="landing-hero__headline">
            Borrow tools from neighbors you trust.
          </h1>
          <p className="landing-hero__subhead">
            Stop buying a drill you'll use twice a year. Someone on your
            street already owns one.
          </p>
          <div className="landing-hero__ctas">
            <Link to="/browse" className="landing-cta landing-cta--primary">
              Browse available tools
            </Link>
            <Link to="/register" className="landing-cta landing-cta--ghost">
              Create an account
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-steps">
        <div className="landing-step">
          <span className="landing-step__num">1</span>
          <h2>List</h2>
          <p>Add tools sitting in your garage that you're happy to lend.</p>
        </div>
        <div className="landing-step">
          <span className="landing-step__num">2</span>
          <h2>Borrow</h2>
          <p>Pick a return date and check something out instantly.</p>
        </div>
        <div className="landing-step">
          <span className="landing-step__num">3</span>
          <h2>Return</h2>
          <p>Bring it back clean and ready for the next neighbor.</p>
        </div>
      </section>

      {status === 'ready' && tools.length > 0 && (
        <section className="landing-featured">
          <h2 className="landing-featured__heading">
            Recently listed nearby
          </h2>
          <div className="tool-grid">
            {tools.map(tool => (
              <Link key={tool.id} to={`/tools/${tool.id}`}>
                <ToolCard tool={tool} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="landing-footer-cta">
        <h2>Already have an account?</h2>
        <Link to="/login" className="landing-cta landing-cta--primary">
          Log in
        </Link>
      </section>
    </div>
  );
}