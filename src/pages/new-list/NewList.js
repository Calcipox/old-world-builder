import { useState, useEffect, Fragment } from "react";
import { useLocation, Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";

import { Button } from "../../components/button";
import { getRandomId } from "../../utils/id";
import { Header, Main } from "../../components/page";
import { Select } from "../../components/select";
import { NumberInput } from "../../components/number-input";
import gameSystems from "../../assets/armies.json";
import { setLists } from "../../state/lists";
import warhammerFantasy from "../../assets/warhammer-fantasy.png";
import warhammerTheOldWorld from "../../assets/the-old-world.png";

import "./NewList.css";
import { nameMap } from "../magic";

export const NewList = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const location = useLocation();
  const dispatch = useDispatch();
  const intl = useIntl();
  const lists = useSelector((state) => state.lists);
  const [game, setGame] = useState("the-old-world");
  const [army, setArmy] = useState(
    gameSystems.find(({ id }) => id === game).armies[0].id
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(2000);
  const [armyComposition, setArmyComposition] = useState();
  const [redirect, setRedirect] = useState(null);
  const armies = gameSystems.filter(({ id }) => id === game)[0].armies;
  const journalArmies = armies.find(({ id }) => army === id)?.armyComposition;
  const createList = () => {
    const newId = getRandomId();
    const newList = {
      "warhammer-fantasy": {
        name: name,
        description: description,
        game: game,
        points: points,
        army: army,
        lords: [],
        heroes: [],
        core: [],
        special: [],
        rare: [],
        id: newId,
      },
      "the-old-world": {
        name: name,
        description: description,
        game: game,
        points: points,
        army: army,
        characters: [],
        core: [],
        special: [],
        rare: [],
        mercenaries: [],
        allies: [],
        id: newId,
        armyComposition: armyComposition,
      },
    };
    const newLists = [...lists, newList[game]];

    localStorage.setItem("owb.lists", JSON.stringify(newLists));
    dispatch(setLists(newLists));

    setRedirect(newId);
  };
  const handleSystemChange = (event) => {
    setGame(event.target.value);
    setArmy(
      gameSystems.filter(({ id }) => id === event.target.value)[0].armies[0].id
    );
  };
  const handleArmyChange = (value) => {
    setArmy(value);
    setArmyComposition(value);
  };
  const handleArcaneJournalChange = (value) => {
    setArmyComposition(value);
  };
  const handlePointsChange = (event) => {
    setPoints(event.target.value);
  };
  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    createList();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {redirect && <Redirect to={`/editor/${redirect}`} />}

      {isMobile && (
        <Header to="/" headline={intl.formatMessage({ id: "new.title" })} />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to="/"
            headline={intl.formatMessage({ id: "new.title" })}
          />
        )}
        <form onSubmit={handleSubmit} className="new-list">
          {gameSystems.map(({ name, id }) => (
            <div className="radio" key={id}>
              <input
                type="radio"
                id={id}
                name="new-list"
                value={id}
                onChange={handleSystemChange}
                checked={id === game}
                className="radio__input"
                aria-label={name}
              />
              <label htmlFor={id} className="radio__label">
                {id === "warhammer-fantasy" && (
                  <img height="20" src={warhammerFantasy} alt={name} />
                )}
                {id === "the-old-world" && (
                  <>
                    <img height="35" src={warhammerTheOldWorld} alt={name} />
                    <p className="new-list__beta">Beta</p>
                  </>
                )}
              </label>
            </div>
          ))}
          <label htmlFor="name">
            <FormattedMessage id="misc.name" />
          </label>
          <input
            type="text"
            id="name"
            className="input"
            value={name}
            onChange={handleNameChange}
            autoComplete="off"
            required
            maxLength="100"
          />
          <label htmlFor="description">
            <FormattedMessage id="misc.description" />
          </label>
          <input
            type="text"
            id="description"
            className="input"
            value={description}
            onChange={handleDescriptionChange}
            autoComplete="off"
            maxLength="255"
          />
          <label htmlFor="points">
            <FormattedMessage id="misc.points" />
          </label>
          <NumberInput
            id="points"
            min={0}
            value={points}
            onChange={handlePointsChange}
            required
            interval={50}
          />
          <label htmlFor="army">
            <FormattedMessage id="new.army" />
          </label>
          <Select
            id="army"
            options={armies}
            onChange={handleArmyChange}
            selected="empire-of-man"
            spaceBottom
            required
          />
          {journalArmies ? (
            <>
              <label htmlFor="arcane-journal">
                <FormattedMessage id="new.armyComposition" />
              </label>
              <Select
                id="arcane-journal"
                options={[
                  {
                    id: army,
                    name_en: intl.formatMessage({ id: "new.grandArmy" }),
                  },
                  ...journalArmies.map((journalArmy) => ({
                    id: journalArmy,
                    name_en: nameMap[journalArmy].name_en,
                    name_de: nameMap[journalArmy].name_de,
                    name_es: nameMap[journalArmy].name_es,
                    name_fr: nameMap[journalArmy].name_fr,
                  })),
                ]}
                onChange={handleArcaneJournalChange}
                selected={army}
                spaceBottom
              />
            </>
          ) : null}
          <Button centered icon="add-list" submitButton spaceBottom>
            <FormattedMessage id="new.create" />
          </Button>
        </form>
      </MainComponent>
    </>
  );
};
