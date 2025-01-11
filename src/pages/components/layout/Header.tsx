import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaBars, FaFilter, FaTrash } from "react-icons/fa";

// Contexte pharmacies
import { usePharmaciesContext } from "@/contexts/pharmaciesContext";

// Contexte univers
import { useUniversesContext } from "@/contexts/universesContext";
import { Universe } from "@/types/Universe";

// Contexte labDistributors
import { useLabDistributorsContext } from "@/contexts/brandsContext";
import { LabDistributor, BrandLab, RangeName } from "@/types/Brand";

// Contexte products code_13
import { useProductsCode13Context } from "@/contexts/productsContext";
import { ProductCode13 } from "@/types/Product";


const Header: React.FC = () => {
  // États pour contrôler les drawers (gauche & droite)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ========================================================================
  // == PHARMACIES ==========================================================
  // ========================================================================
  const [isPharmacyDropdownOpen, setIsPharmacyDropdownOpen] = useState(false);
  const [searchPharmacy, setSearchPharmacy] = useState("");
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);

  const { pharmacies, loading: pharmaciesLoading, error: pharmaciesError } =
    usePharmaciesContext();

  const filteredPharmacies = pharmacies.filter((pharmacy) =>
    pharmacy.name?.toLowerCase().includes(searchPharmacy.toLowerCase())
  );

  const clearPharmacy = () => {
    setSelectedPharmacy(null);
    setSearchPharmacy("");
  };

  // ========================================================================
  // == UNIVERS / CATEGORIES / SOUS-CATEGORIES ==============================
  // ========================================================================
  const [isUniverseDropdownOpen, setIsUniverseDropdownOpen] = useState(false);
  const [searchUniverse, setSearchUniverse] = useState("");
  const [selectedUniverse, setSelectedUniverse] = useState<Universe | null>(null);

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [isSubCategoryDropdownOpen, setIsSubCategoryDropdownOpen] = useState(false);
  const [searchSubCategory, setSearchSubCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  const { universes, loading: universesLoading, error: universesError } =
    useUniversesContext();

  // Filtrer univers
  const filteredUniverses = universes.filter((u) =>
    u.universe.toLowerCase().includes(searchUniverse.toLowerCase())
  );

  // Catégories pour l'univers sélectionné
  const categoriesForSelectedUniverse = selectedUniverse
    ? selectedUniverse.categories
    : [];
  const filteredCategories = categoriesForSelectedUniverse.filter((c) =>
    c.category.toLowerCase().includes(searchCategory.toLowerCase())
  );

  // Sous-catégories pour la catégorie sélectionnée
  let subCategoriesForSelectedCategory: { sub_category: string }[] = [];
  if (selectedUniverse && selectedCategory) {
    const foundCat = selectedUniverse.categories.find(
      (cat) => cat.category === selectedCategory
    );
    subCategoriesForSelectedCategory = foundCat?.sub_categories || [];
  }
  const filteredSubCategories = subCategoriesForSelectedCategory.filter((sc) =>
    sc.sub_category.toLowerCase().includes(searchSubCategory.toLowerCase())
  );

  // Fonctions clear
  const clearUniverse = () => {
    setSelectedUniverse(null);
    setSearchUniverse("");
    setSelectedCategory(null);
    setSearchCategory("");
    setSelectedSubCategory(null);
    setSearchSubCategory("");
  };
  const clearCategory = () => {
    setSelectedCategory(null);
    setSearchCategory("");
    setSelectedSubCategory(null);
    setSearchSubCategory("");
  };
  const clearSubCategory = () => {
    setSelectedSubCategory(null);
    setSearchSubCategory("");
  };

  // ========================================================================
  // == LAB DISTRIBUTORS / LABORATOIRE / GAMMES =============================
  // ========================================================================
  const [isLabDistributorDropdownOpen, setIsLabDistributorDropdownOpen] = useState(false);
  const [searchLabDistributor, setSearchLabDistributor] = useState("");
  const [selectedLabDistributor, setSelectedLabDistributor] = useState<LabDistributor | null>(null);

  const [isBrandLabDropdownOpen, setIsBrandLabDropdownOpen] = useState(false);
  const [searchBrandLab, setSearchBrandLab] = useState("");
  const [selectedBrandLab, setSelectedBrandLab] = useState<BrandLab | null>(null);

  const [isRangeNameDropdownOpen, setIsRangeNameDropdownOpen] = useState(false);
  const [searchRangeName, setSearchRangeName] = useState("");
  const [selectedRangeName, setSelectedRangeName] = useState<RangeName | null>(null);

  const { labDistributors, loading: labDistLoading, error: labDistError } =
    useLabDistributorsContext();

  // Filtrer distributeurs
  const filteredLabDistributors = labDistributors.filter((ld) =>
    ld.lab_distributor.toLowerCase().includes(searchLabDistributor.toLowerCase())
  );

  // BrandLab (laboratoire)
  const brandLabsForSelected = selectedLabDistributor
    ? selectedLabDistributor.brand_labs
    : [];
  const filteredBrandLabs = brandLabsForSelected.filter((bl) =>
    bl.brand_lab.toLowerCase().includes(searchBrandLab.toLowerCase())
  );

  // range_name (gammes)
  const rangeNamesForSelected = selectedBrandLab
    ? selectedBrandLab.range_names
    : [];
  const filteredRangeNames = rangeNamesForSelected.filter((rn) =>
    rn.range_name.toLowerCase().includes(searchRangeName.toLowerCase())
  );

  // Fonctions clear
  const clearLabDistributor = () => {
    setSelectedLabDistributor(null);
    setSearchLabDistributor("");
    setSelectedBrandLab(null);
    setSearchBrandLab("");
    setSelectedRangeName(null);
    setSearchRangeName("");
  };
  const clearBrandLab = () => {
    setSelectedBrandLab(null);
    setSearchBrandLab("");
    setSelectedRangeName(null);
    setSearchRangeName("");
  };
  const clearRangeName = () => {
    setSelectedRangeName(null);
    setSearchRangeName("");
  };

  // ========================================================================
  // == PRODUCTS (code_13_ref, name) ========================================
  // ========================================================================
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductCode13 | null>(null);

  // Récupération via contexte
  const { productsCode13, loading: productsLoading, error: productsError } =
    useProductsCode13Context();

  // Filtrer par code_13_ref OU name
  const filteredProducts = productsCode13.filter((p) =>
    p.code_13_ref.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  // Clear
  const clearProduct = () => {
    setSelectedProduct(null);
    setSearchProduct("");
  };

  // === Pour tout réinitialiser en même temps ===
  const handleClearAllFilters = () => {
    clearPharmacy();
    clearUniverse();
    clearLabDistributor();
    clearProduct();
  };

  return (
    <>
      {/* NAVBAR */}
      <div className="navbar bg-white shadow-md sticky top-0 z-50 px-6">
        <div className="navbar-start">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="btn btn-ghost btn-circle hover:bg-gray-200 transition"
          >
            <FaBars className="h-5 w-5 text-primary" />
          </button>
        </div>
        <div className="navbar-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={35}
              height={35}
              className="w-9 h-9"
              priority
            />
            <span className="text-lg font-semibold text-primary">Apo Data</span>
          </Link>
        </div>
        <div className="navbar-end">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="btn btn-ghost btn-circle hover:bg-gray-200 transition"
          >
            <FaFilter className="h-5 w-5 text-primary" />
          </button>
        </div>
      </div>

      {/* DRAWER MENU (GAUCHE) */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-50 transition-opacity ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className={`fixed left-0 top-0 h-full w-72 bg-white shadow-lg p-4 transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="menu text-base-content">
            <li>
              <Link href="/" onClick={() => setIsMenuOpen(false)}>
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/ventes" onClick={() => setIsMenuOpen(false)}>
                Ventes
              </Link>
            </li>
            <li>
              <Link href="/pharmacies" onClick={() => setIsMenuOpen(false)}>
                Pharmacies
              </Link>
            </li>
            <li>
              <Link href="/contact" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* DRAWER FILTRES (DROITE) */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-50 transition-opacity ${
          isFilterOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsFilterOpen(false)}
      >
        <div
          className={`fixed right-0 top-0 h-full w-72 bg-white shadow-lg p-4 transition-transform duration-300 ${
            isFilterOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-lg font-bold text-primary">Filtres</div>
          <div className="mt-4 space-y-4">

            {/* -------------------------------------------
                DROPDOWN PHARMACIES
               ------------------------------------------- */}
            <div className="flex items-center space-x-2">
              <div className="dropdown flex-1 relative">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn w-full bg-primary text-white hover:bg-secondary transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPharmacyDropdownOpen(!isPharmacyDropdownOpen);
                  }}
                >
                  {selectedPharmacy || "Sélectionner une pharmacie"}
                </div>

                {isPharmacyDropdownOpen && (
                  <div
                    className="dropdown-content bg-gray-100 shadow rounded-box w-60 absolute right-full top-0 mr-2 p-2 max-h-64 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      placeholder="Rechercher une pharmacie..."
                      className="input input-bordered w-full mb-2 focus:ring-primary"
                      value={searchPharmacy}
                      onChange={(e) => setSearchPharmacy(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <ul className="menu">
                      {pharmaciesLoading ? (
                        <li className="text-gray-500 px-4 py-2">Chargement...</li>
                      ) : pharmaciesError ? (
                        <li className="text-primary px-4 py-2">
                          Erreur de chargement
                        </li>
                      ) : filteredPharmacies.length > 0 ? (
                        filteredPharmacies.map((pharmacy) => (
                          <li
                            key={pharmacy.id}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setSelectedPharmacy(pharmacy.name || "");
                              setIsPharmacyDropdownOpen(false);
                            }}
                            className="hover:bg-primary hover:text-white transition cursor-pointer px-4 py-2 rounded-md"
                          >
                            {pharmacy.name}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 px-4 py-2">
                          Aucune pharmacie trouvée
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <button
                className="btn btn-xs btn-ghost text-primary hover:text-secondary shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  clearPharmacy();
                }}
              >
                <FaTrash />
              </button>
            </div>

            {/* Séparateur entre Pharmacie et Univers */}
            <hr className="border-gray-300 my-2" />

            {/* -------------------------------------------
                DROPDOWN UNIVERS -> CAT -> SOUS-CAT
               ------------------------------------------- */}
            {/* Univers (toujours affiché) */}
            <div className="flex items-center space-x-2">
              <div className="dropdown flex-1 relative">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn w-full bg-primary text-white hover:bg-secondary transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUniverseDropdownOpen(!isUniverseDropdownOpen);
                  }}
                >
                  {selectedUniverse?.universe || "Sélectionner un univers"}
                </div>

                {isUniverseDropdownOpen && (
                  <div
                    className="dropdown-content bg-gray-100 shadow rounded-box w-60 absolute right-full top-0 mr-2 p-2 max-h-64 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      placeholder="Rechercher un univers..."
                      className="input input-bordered w-full mb-2 focus:ring-primary"
                      value={searchUniverse}
                      onChange={(e) => setSearchUniverse(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <ul className="menu">
                      {universesLoading ? (
                        <li className="text-gray-500 px-4 py-2">Chargement...</li>
                      ) : universesError ? (
                        <li className="text-primary px-4 py-2">
                          Erreur de chargement
                        </li>
                      ) : filteredUniverses.length > 0 ? (
                        filteredUniverses.map((univ) => (
                          <li
                            key={univ.universe}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setSelectedUniverse(univ);
                              setSelectedCategory(null);
                              setSelectedSubCategory(null);
                              setIsUniverseDropdownOpen(false);
                            }}
                            className="hover:bg-primary hover:text-white transition cursor-pointer px-4 py-2 rounded-md"
                          >
                            {univ.universe}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 px-4 py-2">
                          Aucun univers trouvé
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <button
                className="btn btn-xs btn-ghost text-primary hover:text-secondary shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  clearUniverse();
                }}
              >
                <FaTrash />
              </button>
            </div>

            {/* Catégorie (toujours affichée) */}
            <div className="flex items-center space-x-2">
              <div className="dropdown flex-1 relative">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn w-full bg-primary text-white hover:bg-secondary transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                  }}
                >
                  {selectedCategory || "Sélectionner une catégorie"}
                </div>

                {isCategoryDropdownOpen && (
                  <div
                    className="dropdown-content bg-gray-100 shadow rounded-box w-60 absolute right-full top-0 mr-2 p-2 max-h-64 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      placeholder="Rechercher une catégorie..."
                      className="input input-bordered w-full mb-2 focus:ring-primary"
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <ul className="menu">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat) => (
                          <li
                            key={cat.category}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setSelectedCategory(cat.category);
                              setSelectedSubCategory(null);
                              setIsCategoryDropdownOpen(false);
                            }}
                            className="hover:bg-primary hover:text-white transition cursor-pointer px-4 py-2 rounded-md"
                          >
                            {cat.category}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 px-4 py-2">
                          Aucune catégorie trouvée
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <button
                className="btn btn-xs btn-ghost text-primary hover:text-secondary shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  clearCategory();
                }}
              >
                <FaTrash />
              </button>
            </div>

            {/* Sous-catégorie (toujours affichée) */}
            <div className="flex items-center space-x-2">
              <div className="dropdown flex-1 relative">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn w-full bg-primary text-white hover:bg-secondary transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSubCategoryDropdownOpen(!isSubCategoryDropdownOpen);
                  }}
                >
                  {selectedSubCategory || "Sélectionner une sous-catégorie"}
                </div>

                {isSubCategoryDropdownOpen && (
                  <div
                    className="dropdown-content bg-gray-100 shadow rounded-box w-60 absolute right-full top-0 mr-2 p-2 max-h-64 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      placeholder="Rechercher une sous-catégorie..."
                      className="input input-bordered w-full mb-2 focus:ring-primary"
                      value={searchSubCategory}
                      onChange={(e) => setSearchSubCategory(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <ul className="menu">
                      {filteredSubCategories.length > 0 ? (
                        filteredSubCategories.map((sc) => (
                          <li
                            key={sc.sub_category}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setSelectedSubCategory(sc.sub_category);
                              setIsSubCategoryDropdownOpen(false);
                            }}
                            className="hover:bg-primary hover:text-white transition cursor-pointer px-4 py-2 rounded-md"
                          >
                            {sc.sub_category}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 px-4 py-2">
                          Aucune sous-catégorie trouvée
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <button
                className="btn btn-xs btn-ghost text-primary hover:text-secondary shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSubCategory();
                }}
              >
                <FaTrash />
              </button>
            </div>

            {/* -------------------------------------------
                LAB DISTRIBUTORS => LABORATOIRE => GAMMES
               ------------------------------------------- */}
            <hr className="border-gray-300 my-2" />

            {/* Distributeur (toujours affiché) */}
            <div className="flex items-center space-x-2">
              <div className="dropdown flex-1 relative">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn w-full bg-primary text-white hover:bg-secondary transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLabDistributorDropdownOpen(!isLabDistributorDropdownOpen);
                  }}
                >
                  {selectedLabDistributor?.lab_distributor || "Sélectionner un distributeur"}
                </div>

                {isLabDistributorDropdownOpen && (
                  <div
                    className="dropdown-content bg-gray-100 shadow rounded-box w-60 absolute right-full top-0 mr-2 p-2 max-h-64 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      placeholder="Rechercher un distributeur..."
                      className="input input-bordered w-full mb-2 focus:ring-primary"
                      value={searchLabDistributor}
                      onChange={(e) => setSearchLabDistributor(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <ul className="menu">
                      {labDistLoading ? (
                        <li className="text-gray-500 px-4 py-2">Chargement...</li>
                      ) : labDistError ? (
                        <li className="text-primary px-4 py-2">
                          Erreur de chargement
                        </li>
                      ) : filteredLabDistributors.length > 0 ? (
                        filteredLabDistributors.map((ld) => (
                          <li
                            key={ld.lab_distributor}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setSelectedLabDistributor(ld);
                              setSelectedBrandLab(null);
                              setSelectedRangeName(null);
                              setIsLabDistributorDropdownOpen(false);
                            }}
                            className="hover:bg-primary hover:text-white transition cursor-pointer px-4 py-2 rounded-md"
                          >
                            {ld.lab_distributor}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 px-4 py-2">
                          Aucun distributeur trouvé
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <button
                className="btn btn-xs btn-ghost text-primary hover:text-secondary shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  clearLabDistributor();
                }}
              >
                <FaTrash />
              </button>
            </div>

            {/* Laboratoire (toujours affiché) */}
            <div className="flex items-center space-x-2">
              <div className="dropdown flex-1 relative">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn w-full bg-primary text-white hover:bg-secondary transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsBrandLabDropdownOpen(!isBrandLabDropdownOpen);
                  }}
                >
                  {selectedBrandLab?.brand_lab || "Sélectionner un laboratoire"}
                </div>

                {isBrandLabDropdownOpen && (
                  <div
                    className="dropdown-content bg-gray-100 shadow rounded-box w-60 absolute right-full top-0 mr-2 p-2 max-h-64 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      placeholder="Rechercher un laboratoire..."
                      className="input input-bordered w-full mb-2 focus:ring-primary"
                      value={searchBrandLab}
                      onChange={(e) => setSearchBrandLab(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <ul className="menu">
                      {filteredBrandLabs.length > 0 ? (
                        filteredBrandLabs.map((bl) => (
                          <li
                            key={bl.brand_lab}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setSelectedBrandLab(bl);
                              setSelectedRangeName(null);
                              setIsBrandLabDropdownOpen(false);
                            }}
                            className="hover:bg-primary hover:text-white transition cursor-pointer px-4 py-2 rounded-md"
                          >
                            {bl.brand_lab}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 px-4 py-2">
                          Aucun laboratoire trouvé
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <button
                className="btn btn-xs btn-ghost text-primary hover:text-secondary shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  clearBrandLab();
                }}
              >
                <FaTrash />
              </button>
            </div>

            {/* Gammes (toujours affiché) */}
            <div className="flex items-center space-x-2">
              <div className="dropdown flex-1 relative">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn w-full bg-primary text-white hover:bg-secondary transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRangeNameDropdownOpen(!isRangeNameDropdownOpen);
                  }}
                >
                  {selectedRangeName?.range_name || "Sélectionner une gamme"}
                </div>

                {isRangeNameDropdownOpen && (
                  <div
                    className="dropdown-content bg-gray-100 shadow rounded-box w-60 absolute right-full top-0 mr-2 p-2 max-h-64 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      placeholder="Rechercher une gamme..."
                      className="input input-bordered w-full mb-2 focus:ring-primary"
                      value={searchRangeName}
                      onChange={(e) => setSearchRangeName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <ul className="menu">
                      {filteredRangeNames.length > 0 ? (
                        filteredRangeNames.map((rn) => (
                          <li
                            key={rn.range_name}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setSelectedRangeName(rn);
                              setIsRangeNameDropdownOpen(false);
                            }}
                            className="hover:bg-primary hover:text-white transition cursor-pointer px-4 py-2 rounded-md"
                          >
                            {rn.range_name}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 px-4 py-2">
                          Aucune gamme trouvée
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <button
                className="btn btn-xs btn-ghost text-primary hover:text-secondary shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  clearRangeName();
                }}
              >
                <FaTrash />
              </button>
            </div>

            {/* -------------------------------------------
                BOUTONS D'ACTION
               ------------------------------------------- */}
            <div className="flex flex-col space-y-2 mt-4">
              <button
                className="btn bg-primary text-white hover:bg-secondary transition w-full"
                onClick={() => {
                  alert(`
Appliquer tous les filtres

Pharmacie: ${selectedPharmacy}
Univers: ${selectedUniverse?.universe}
Catégorie: ${selectedCategory}
Sous-catégorie: ${selectedSubCategory}
Distributeur: ${selectedLabDistributor?.lab_distributor}
Laboratoire: ${selectedBrandLab?.brand_lab}
Gamme: ${selectedRangeName?.range_name}
Produit: ${
  selectedProduct
    ? `${selectedProduct.code_13_ref} - ${selectedProduct.name}`
    : ""
}
                  `);
                }}
              >
                Appliquer tous les filtres
              </button>

              <button
                className="btn bg-primary text-white hover:bg-secondary transition w-full"
                onClick={handleClearAllFilters}
              >
                Effacer tous les filtres
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
