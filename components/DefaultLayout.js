import Head from "next/head";
import Link from "next/link";
import PropTypes from "prop-types";
import { CgProfile } from "react-icons/cg";
import { TfiMenu } from "react-icons/tfi";
import useLogout from "hooks/useLogout";
import Image from "next/image";

import {
  HTTP_STATUSES,
  loginStates,
  SIDENAV_ITEMS,
  SIDENAV_ITEM_OBJS,
  cookieKeys
} from "utils/constants";
import Dropdown from "./Dropdown";
import useLogin from "hooks/useLogin";
import appRoutes from "utils/app-routes";
import useUserProfile from "hooks/useUserProfile";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import deviceState from "states/deviceState";
import SearchBar from "./SearchBar";
import Modal from "./Modal";
import request from "utils/api";
import apiRoutes from "utils/api-routes";
import Button from "./Button";
import moduleState from "states/modules";
import { useRouter } from "next/router";
import { getCookie } from "utils/storage";

const DefaultLayout = ({ pageTitle, children, activeItemId }) => {
  const { cusmatAdmin } = useUserProfile();
  const { screenWidth } = useRecoilValue(deviceState);
  const [modules, setModules] = useRecoilState(moduleState);
  const [showSwitchOrgModal, setShowSwitchOrgModal] = useState(false);
  const [rerender, setRerender] = useState(0);

  const handleLogout = useLogout();
  const { status } = useLogin();
  const { organization, setOrganization } = useUserProfile();
  const [showMenu, setShowMenu] = useState(screenWidth > 640 ? true : false);
  const [orgList, setOrgList] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("Select Organization");
  const [orgSlug, setOrgSlug] = useState(null);
  const ref = useRef(null);
  const router = useRouter();

  useEffect(() => {
    ref.current = getCookie(cookieKeys.ORG_SLUG);
    setOrgSlug(ref.current);
  }, []);

  const getOrganizations = async () => {
    const res = await request(apiRoutes.organization.list, {
      isAuthenticated: true
    });
    if (res.status == HTTP_STATUSES.OK) {
      const orgsJson = await res.json();
      setOrgList(orgsJson.results);
    }
  };
  useEffect(() => {
    if (showSwitchOrgModal && orgList.length < 1) {
      getOrganizations();
    }
  }, [showSwitchOrgModal]);
  const sideNavClick = name => {
    setModules(old => ({
      modules: [...old.modules],
      active: name
    }));
  };

  const getModuleAnalytics = async () => {
    if (router.route === "/useCases") {
      setModules({});
    }
    let filterString = `include_levels=true`;
    if (organization) {
      filterString += `&organization_id=${organization.id}`;
    }
    const res = await request(
      `${apiRoutes.organization.modules}?${filterString}`,
      {
        isAuthenticated: true,
        organization: organization.id
      }
    );
    if (res.status == HTTP_STATUSES.OK) {
      const resJson = await res.json();
      Object.keys(SIDENAV_ITEM_OBJS).forEach(key => {
        if (SIDENAV_ITEM_OBJS[key].hasOwnProperty("temp")) {
          delete SIDENAV_ITEM_OBJS[key];
        }
      });
      if (SIDENAV_ITEMS[1].children) {
        SIDENAV_ITEMS[1].children = [];
      }

      resJson.results.forEach(mod => {
        const name = mod.module.name.toUpperCase();
        if (SIDENAV_ITEM_OBJS[name]) return;
        SIDENAV_ITEM_OBJS[name] = {
          id: name.toLowerCase(),
          title: mod.module.name,
          link: "",
          temp: true,
          onClick: () => sideNavClick(mod.module.name)
        };
        if (!SIDENAV_ITEMS[1].children) SIDENAV_ITEMS[1].children = [];
        SIDENAV_ITEMS[1].children.push({
          id: name.toLowerCase(),
          title: mod.module.name,
          icon: "",
          activeIcon: "",
          route: "/useCases?searchModule=" + mod.module.name,
          temp: true,
          onClick: () => sideNavClick(mod.module.name)
        });
      });
      if (resJson.results[0]) {
        setModules(old => ({
          modules: resJson.results,
          active: old.active
          // active: resJson.results[0].module.name
        }));
        setRerender(rerender + 1);
      }
      // if (router.route === "/useCases")
      //   router.push("/useCases?searchModule=" + resJson.results[0].module.name);
    }
  };

  useEffect(() => {
    if (organization) getModuleAnalytics();
    else {
      setModules({});
      Object.keys(SIDENAV_ITEM_OBJS).forEach(key => {
        if (SIDENAV_ITEM_OBJS[key].hasOwnProperty("temp")) {
          delete SIDENAV_ITEM_OBJS[key];
        }
      });
      if (SIDENAV_ITEMS[1].children) {
        SIDENAV_ITEMS[1].children = [];
      }
    }
  }, [organization]);
  var camalize = function camalize(str) {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
  };

  useEffect(() => {
    setSelectedOrg(organization ? organization.name : "Select Organization");
  }, [organization]);

  const menuItems = [
    {
      id: 1,
      name: (
        <button
          className="w-full text-left p-2 mt-1"
          onClick={() => router.push(appRoutes.profile)}
        >
          Profile
        </button>
      )
    },
    {
      id: 2,
      name: (
        <button
          disabled={!cusmatAdmin}
          className={`w-full text-left p-2`}
          onClick={() => setShowSwitchOrgModal(true)}
        >
          Switch Users
        </button>
      )
    },
    {
      id: 3,
      name: (
        <button className="w-full text-left p-2" onClick={handleLogout}>
          Log out
        </button>
      )
    }
  ];

  const profileSettings = (
    <div className="dropdown dropdown-bottom dropdown-end border bg-slate-100 md:mr-2 relative">
      <Dropdown
        mainDropdown
        btnCss="p-2 pt-3 text-center font-semibold text-sm md:text-md "
        menuItems={!cusmatAdmin ? [menuItems[0], menuItems[2]] : menuItems}
        btnContent={
          <>
            <CgProfile size={"40"} className="p-2 md:px-1 " />
            <span className="font-semibold text-lg hidden md:inline">
              Cusmat Technologies
            </span>
          </>
        }
      />
    </div>
  );

  const showHide = (elementId, navItem) => {
    let x = document.getElementById(elementId);
    if (x) {
      if (Array.from(x.classList).includes("hidden")) {
        x.classList.remove("hidden");
        x.classList.add("block");
      } else {
        x.classList.add("hidden");
        x.classList.remove("block");
      }
    }
  };

  const navLink = navItem => (
    <div className="relative">
      {showMenu && navItem.children ? (
        <div className="cursor-pointer">
          {navItem.icon != "" && (
            <>
              <Image
                src={navItem.icon}
                className={`${
                  activeItemId === navItem.id
                    ? "text-primary"
                    : "text-slate-500"
                } inline mr-1 `}
                width={12}
                height={12}
                alt={navItem.title}
              />
            </>
          )}

          <span
            className={`p-0 ${showMenu ? "inline" : "hidden"} relative `}
            onClick={e => {
              if (navItem.onClick) navItem.onClick();
            }}
          >
            {navItem.title}
          </span>
        </div>
      ) : (
        <Link
          href={navItem.route ? navItem.route : ""}
          onClick={() => {
            // setModules(old => ({ modules: old.modules, active: null }));
            setShowMenu(showMenu && screenWidth > 641 ? true : false);
          }}
          className="relative"
        >
          {navItem.icon != "" && (
            <>
              <Image
                src={navItem.icon}
                className={`${
                  activeItemId === navItem.id
                    ? "text-primary"
                    : "text-slate-500"
                } inline mr-1 `}
                width={12}
                height={12}
                alt={navItem.title}
              />
            </>
          )}

          <span
            className={`p-0 ${showMenu ? "inline" : "hidden"} relative `}
            onClick={e => {
              if (navItem.onClick) navItem.onClick();
            }}
          >
            {navItem.title}
          </span>
        </Link>
      )}

      {!navItem.children && !showMenu && (
        <div className="children hidden bg-white w-[200px]  absolute left-[47px] top-0 border border-slate-200 shadow-lg">
          <ol id={`navChild_${navItem.id}`} className="">
            <Link
              href={navItem.route ? navItem.route : ""}
              onClick={() => {
                setShowMenu(showMenu && screenWidth > 641 ? true : false);
              }}
              className="relative"
            >
              <li
                key={`child${navItem.id} `}
                className={`font-medium hover:bg-slate-50 ${
                  activeItemId === navItem.id
                    ? " text-primary"
                    : "text-zinc-400"
                } font-semibold text-sm md:text-md px-1 py-2`}
              >
                <span
                  className={`p-1 ${showMenu ? "hidden" : "inline"} relative`}
                >
                  {navItem.title}
                </span>
              </li>
            </Link>
          </ol>
        </div>
      )}
      {navItem.children && !showMenu && (
        <div className="children hidden bg-white w-[200px]  absolute left-[47px] top-0 border border-slate-200 shadow-lg">
          <ol id={`navChild_${navItem.id}`} className="">
            {navItem.children.map(item => (
              <Link
                key={item.route}
                href={item.route ? item.route : ""}
                onClick={() => {
                  setShowMenu(showMenu && screenWidth > 641 ? true : false);
                }}
                className="relative"
              >
                <li
                  key={`child${item.id} `}
                  className={`font-medium hover:bg-slate-50 ${
                    activeItemId === item.id ? " text-primary" : "text-zinc-400"
                  } font-semibold text-sm md:text-md px-1 py-2`}
                >
                  <span
                    onClick={e => {
                      if (item.onClick) item.onClick();
                    }}
                    className={`p-1 ${showMenu ? "hidden" : "block"} relative`}
                  >
                    {item.title}
                  </span>
                </li>
              </Link>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
  const sideNav = (
    <div className="pl-3 ">
      <div className="text-xs md:text-sm p-2 text-slate-500 font-medium">
        Menu
      </div>
      <ul className="ml-4 ">
        {SIDENAV_ITEMS &&
          SIDENAV_ITEMS.map(navItem => {
            return (
              <li
                key={navItem.id}
                className={`font-medium parent ${
                  activeItemId === navItem.id
                    ? "text-primary"
                    : "text-slate-500"
                } font-semibold text-sm md:text-md p-1 capitalize py-2`}
              >
                <span
                  onClick={() => {
                    showHide(`navChild_${navItem.id}`, navItem);
                  }}
                >
                  {navLink(navItem)}
                </span>
                {showMenu && navItem.children && (
                  <ol
                    id={`navChild_${navItem.id}`}
                    className={`pl-1 ml-2 pt-2 ${
                      camalize(navItem.title.toLowerCase()) !==
                        router.route.split("/")[1] && "hidden"
                    } `}
                  >
                    {navItem.children.map(item => (
                      <li
                        key={`child${item.id}`}
                        className={`font-medium ${
                          activeItemId === item.id
                            ? "text-primary"
                            : "text-zinc-400"
                        }
                        font-semibold text-sm md:text-md px-1 py-2`}
                      >
                        {navLink(item)}
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      {status == loginStates.IS_LOGGED_IN ? (
        <div className="bg-white w-full relative min-h-[100vh] flex flex-col">
          <Modal
            show={showSwitchOrgModal}
            onHide={() => setShowSwitchOrgModal(false)}
            title="Switch Organization"
            showCloseBtn
          >
            <div className="p-4 flex flex-col gap-y-5 justify-items-center capitalize">
              <div className="dropdown mr-2 relative block ">
                <Dropdown
                  btnCss="p-2 text-center border text-md bg-[#F4F3F8] rounded "
                  dropdownCss="max-w-[250px] mx-auto"
                  handleClick={org => {
                    setSelectedOrg(org);
                  }}
                  selectedValue={selectedOrg}
                  isSelection
                  menuItems={orgList.map(org => {
                    return {
                      id: org.id,
                      name: org.name
                    };
                  })}
                />
              </div>

              <Button
                btnVariant="primary"
                className="p-2 px-4 mx-auto rounded w-[200px]"
                onClick={() => {
                  orgList.map(or => {
                    if (or.name == selectedOrg) {
                      // if (router.route === "/useCases") {
                      router.push("/dashboard");
                      // }
                      setOrganization({
                        id: or.id,
                        name: or.name,
                        slug: or.slug,
                        logo: or.logo
                      });
                    }
                  });
                  setShowSwitchOrgModal(false);
                }}
              >
                Confirm
              </Button>
            </div>
          </Modal>
          <div className="flex flex-row text-slate-500  md:h-full">
            <div
              className={`flex-shrink-0 ${
                !showMenu ? "w-[80px]" : "w-[80px] md:w-[220px]"
              } bg-white border border-[#E9EAED] border-r-0 font-bold px-4 text-lg flex justify-between`}
            >
              {showMenu && (
                <div className="hidden md:inline uppercase my-auto truncate">
                  <span className="">
                    {organization && organization.logo && (
                      <img
                        src={organization && organization.logo}
                        width="40"
                        height="auto"
                        alt="logo"
                        className="inline p-0 m-0 mr-2"
                      />
                    )}
                    <div
                      className="inline cursor-default"
                      onMouseEnter={() => {
                        if (organization?.name.length > 5) {
                          document
                            .getElementById("org_name")
                            .classList.remove("invisible");
                        }
                      }}
                      onMouseLeave={() => {
                        if (organization?.name.length > 5) {
                          document
                            .getElementById("org_name")
                            .classList.add("invisible");
                        }
                      }}
                    >
                      {organization ? organization.name : "Cusmat"}
                      <div
                        id="org_name"
                        className="absolute invisible left-5 bg-white border top-2 rounded p-1 text-sm"
                      >
                        {organization ? organization.name : "Cusmat"}
                      </div>
                    </div>
                  </span>
                </div>
              )}
              <TfiMenu
                size="15"
                className={`w-[30px] inline my-auto mx-auto cursor-pointer ${
                  showMenu ? "mx-auto md:mr-0" : ""
                }`}
                onClick={() => setShowMenu(!showMenu)}
              />
            </div>
            <div
              className={`w-full border border-[#E9EAED] flex ${
                organization && organization.name.toLowerCase() !== "cusmat"
                  ? "justify-between"
                  : "justify-end"
              } bg-white`}
            >
              {organization && organization.name.toLowerCase() !== "cusmat" && (
                <SearchBar organization={organization} />
              )}

              {profileSettings}
            </div>
          </div>
          <div className="flex relative flex-1 min-h-[calc(100vh-64px)] bg-white">
            {organization && organization.name.toLowerCase() !== "cusmat" && (
              <div
                className={`flex-shrink-0   ${
                  showMenu ? "w-[220px] z-40" : "w-[80px] hidden lg:inline"
                } h-full border-[#E9EAED] lg:border-0 lg:relative z-50 top-0 `}
              >
                {sideNav}
              </div>
            )}
            <div
              className={`w-full border-l border-[#E9EAED]  pb-10 ${
                showMenu
                  ? organization && organization.name.toLowerCase() !== "cusmat"
                    ? "lg:w-[calc(100%-220px)] "
                    : "lg:w-full"
                  : organization === null ||
                    (organization &&
                      organization.name.toLowerCase() === "cusmat")
                  ? "lg:w-full"
                  : "lg:w-[calc(100%-80px)]"
              }`}
            >
              {children}
            </div>
          </div>
        </div>
      ) : status == loginStates.IS_LOADING ? (
        <div className="flex justify-center items-center h-screen bg-white p-4">
          <a
            className="pl-2 underline text-primary"
            href={
              orgSlug
                ? appRoutes.login.replace(":slug", JSON.parse(orgSlug).slug)
                : appRoutes.root
            }
          >
            Login here
          </a>
          {/* Loading... */}
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen bg-white p-4 text-black">
          You are logged out
          <a
            className="pl-2 underline text-primary"
            href={
              orgSlug
                ? appRoutes.login.replace(":slug", JSON.parse(orgSlug).slug)
                : appRoutes.root
            }
          >
            Login here
          </a>
        </div>
      )}
    </>
  );
};

DefaultLayout.propTypes = {
  pageTitle: PropTypes.string
};

DefaultLayout.defaultProps = {
  pageTitle: ""
};

export default DefaultLayout;
