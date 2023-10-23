(ns murrrrrr.page-mounting
  (:require
   [reagent.core :as r]
   [reagent.session :as session]
   [murrrrrr.routes :refer [path-for]]
   [murrrrrr.components.toggle :refer [toggle]]
   [murrrrrr.utils :refer [update-css!]]))

(defn toggle-colorscheme [state]
  (let [body (.-body js/document)]
    (.. body -classList (toggle "dark-mode" (not state)))
    (.. body -classList (toggle "light-mode" state))))

;; -------------------------
;; Page mounting component

(defn current-page []
  (fn []
    (let [page (:current-page (session/get :route))]
      [:<>
       [:header
        [:nav
         [:ul
          [:li [:a {:href (path-for :index)} "Home"]]
          [:li [:a {:href (path-for :about)} "About"]]]]]
       [page]
       [:footer
        [:p "This is the foooter"]
        [toggle toggle-colorscheme]]])))

