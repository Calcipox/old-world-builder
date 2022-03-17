import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { Header, Main } from "../../components/page";

export const Help = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Header headline="Old World Builder" />

      <Main compact>
        <Link to="/">Zurück zur Startseite</Link>

        <h2>Hilfe</h2>
        <p>
          Falls du Fragen zum OWL hast, kannst du diese im OWL Thema des{" "}
          <a
            href="https://www.gw-fanworld.net"
            target="_blank"
            rel="noreferrer"
          >
            GW-Fanworld.net Forums
          </a>{" "}
          stellen.
        </p>
        <p>
          Alternativ kannst du auch direkt eine E-Mail schreiben an{" "}
          <a href="mailto:hello@old-world-builder.com">
            hello@old-world-builder.com
          </a>
          .
        </p>
      </Main>
    </>
  );
};
