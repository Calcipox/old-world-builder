import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FormattedMessage } from "react-intl";

import { Spinner } from "../../components/spinner";
import { useLanguage } from "../../utils/useLanguage";
import germany from "../../assets/germany.svg";
import usa from "../../assets/usa.svg";
import spain from "../../assets/spain.svg";
import france from "../../assets/france.svg";
import italy from "../../assets/italy.svg";
import polen from "../../assets/polen.svg";
import china from "../../assets/china.svg";

import "./Page.css";

export const Main = ({ className, children, isDesktop, compact, loading }) => {
  const { language } = useLanguage();
  const handleLanguageChange = (event) => {
    localStorage.setItem("lang", event.target.value);
    window.location.reload();
  };

  return (
    <>
      <main
        className={classNames(
          "main",
          isDesktop ? "main--desktop" : "main--mobile",
          compact && "main--compact",
          className
        )}
      >
        {children}
        {loading && <Spinner />}
      </main>
      {!loading && (
        <footer className="footer">
          <nav className="footer__navigation">
            <Link to="/about">
              <FormattedMessage id="footer.about" />
            </Link>
            <Link to="/help">
              <FormattedMessage id="footer.help" />
            </Link>
            <Link to="/custom-datasets">
              <FormattedMessage id="footer.custom-datasets" />
            </Link>
            <Link to="/datasets">
              <FormattedMessage id="footer.datasets-editor" />
            </Link>
            <Link to="/changelog">
              <FormattedMessage id="footer.changelog" />
            </Link>
            <Link to="/privacy">
              <FormattedMessage id="footer.privacy" />
            </Link>
          </nav>
          <div className="footer__languages">
            <div className="radio">
              <input
                type="radio"
                id="english"
                name="languages"
                value="en"
                onChange={handleLanguageChange}
                defaultChecked={language === "en"}
                className="radio__input"
              />
              <label htmlFor="english" className="radio__label">
                <img
                  width="24"
                  height="19"
                  alt=""
                  src={usa}
                  className="footer__language-icon"
                />
                English
              </label>
            </div>
            <div className="radio">
              <input
                type="radio"
                id="deutsch"
                name="languages"
                value="de"
                onChange={handleLanguageChange}
                defaultChecked={language === "de"}
                className="radio__input"
              />
              <label htmlFor="deutsch" className="radio__label">
                <img
                  width="24"
                  height="19"
                  alt=""
                  src={germany}
                  className="footer__language-icon"
                />
                Deutsch
              </label>
            </div>
            <div className="radio">
              <input
                type="radio"
                id="french"
                name="languages"
                value="fr"
                onChange={handleLanguageChange}
                defaultChecked={language === "fr"}
                className="radio__input"
              />
              <label htmlFor="french" className="radio__label">
                <img
                  width="24"
                  height="19"
                  alt=""
                  src={france}
                  className="footer__language-icon"
                />
                Français
              </label>
            </div>
            <div className="radio">
              <input
                type="radio"
                id="spanish"
                name="languages"
                value="es"
                onChange={handleLanguageChange}
                defaultChecked={language === "es"}
                className="radio__input"
              />
              <label htmlFor="spanish" className="radio__label">
                <img
                  width="24"
                  height="19"
                  alt=""
                  src={spain}
                  className="footer__language-icon"
                />
                Español
              </label>
            </div>
            <div className="radio">
              <input
                type="radio"
                id="italian"
                name="languages"
                value="it"
                onChange={handleLanguageChange}
                defaultChecked={language === "it"}
                className="radio__input"
              />
              <label htmlFor="italian" className="radio__label">
                <img
                  width="24"
                  height="19"
                  alt=""
                  src={italy}
                  className="footer__language-icon"
                />
                Italiano
              </label>
            </div>
            <div className="radio">
              <input
                type="radio"
                id="polish"
                name="languages"
                value="pl"
                onChange={handleLanguageChange}
                defaultChecked={language === "pl"}
                className="radio__input"
              />
              <label htmlFor="polish" className="radio__label">
                <img
                  width="24"
                  height="19"
                  alt=""
                  src={polen}
                  className="footer__language-icon"
                />
                Polski
              </label>
            </div>
            <div className="radio">
              <input
                type="radio"
                id="chinese"
                name="languages"
                value="cn"
                onChange={handleLanguageChange}
                defaultChecked={language === "cn"}
                className="radio__input"
              />
              <label htmlFor="chinese" className="radio__label">
                <img
                  width="24"
                  height="19"
                  alt=""
                  src={china}
                  className="footer__language-icon"
                />
                简体中文
              </label>
            </div>
          </div>
        </footer>
      )}
    </>
  );
};

Main.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  isDesktop: PropTypes.bool,
};
