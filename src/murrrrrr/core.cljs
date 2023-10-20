(ns murrrrrr.core
  (:require
   [reagent.core :as r]
   [reagent.dom :as d]
   [reagent.session :as session]
   [reitit.frontend :as reitit]
   [clerk.core :as clerk]
   [accountant.core :as accountant]
   [murrrrrr.routes :refer [router]]
   [murrrrrr.page-mounting :refer [page-for current-page]]
   [murrrrrr.utils :refer [sleep update-root-css]]))

(def first-load? (atom true))

;; -------------------------
;; Initialize app

(defn mount-root []
  (d/render [current-page] (.getElementById js/document "app")))

(defn transition! [current-page route-params]
  (reset! first-load? false)
  (session/put! :route {:current-page (page-for current-page)
                        :route-params route-params}))

(defn delay-transition! [current-page route-params]
  (update-root-css (.-documentElement js/document) :--black "#222")
  (sleep (fn []
           (transition! current-page route-params)
           (update-root-css (.-documentElement js/document) :--black "#000")) 500))

(defn init! []
  (clerk/initialize!)
  (accountant/configure-navigation!
   {:nav-handler
    (fn [path]
      (let [match (reitit/match-by-path router path)
            current-page (:name (:data  match))
            route-params (:path-params match)]
        (r/after-render clerk/after-render!)
        (if @first-load?
          (transition! current-page route-params)
          (delay-transition! current-page route-params))

        (clerk/navigate-page! path)))
    :path-exists?
    (fn [path]
      (boolean (reitit/match-by-path router path)))})
  (accountant/dispatch-current!)
  (mount-root))

(defn ^:dev/after-load reload! []
  (mount-root))
