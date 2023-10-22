(ns murrrrrr.page-mounting
  (:require
   [reagent.session :as session]
   [murrrrrr.routes :refer [path-for]]
   [murrrrrr.pages.home :refer [home-page]]
   [murrrrrr.pages.about :refer [about-page]]
   [murrrrrr.components.colorscheme-toggle :refer [colorscheme-toggle]]))

;; -------------------------
;; Page mounting component

(defn current-page []
  (fn []
    (let [page (:current-page (session/get :route))]
      [:div
       [:header
        [:nav
         [:ul
          [:li [:a {:href (path-for :index)} "Home"]]
          [:li [:a {:href (path-for :about)} "About"]]]]]
       [page]
       [:footer
        [:p "This is the foooter"]
        [colorscheme-toggle]]])))

;; -------------------------
;; Translate routes -> page components

(defn page-for [route]
  (case route
    :index #'home-page
    :about #'about-page))

