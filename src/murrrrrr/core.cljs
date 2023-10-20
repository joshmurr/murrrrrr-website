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
   [murrrrrr.utils :refer [sleep update-css!]]
   [clojure.string]
   ["@geomm/maths" :refer (identityMat matFromTransformations)]))

(def first-load? (atom true))

;; -------------------------
;; Initialize app

(defn mount-root []
  (d/render [current-page] (.getElementById js/document "app")))

(defn transition! [current-page route-params]
  (reset! first-load? false)
  (session/put! :route {:current-page (page-for current-page)
                        :route-params route-params}))

(defn- mat-to-string [mat]
  (str "matrix3d(" (clojure.string/join ", " mat) ")"))
(defonce hidden-mat (mat-to-string (matFromTransformations
                                    #js {"translation" #js [0 24 0],
                                         "rotation" #js {"axis" #js [0 0 0]
                                                         "angle" 0}
                                         "scale" #js [1 1 1]})))
(defonce visible-mat (mat-to-string (identityMat)))

(defn init-css-variables! []
  (let [root (.querySelector js/document ":root")]
    (update-css! root :--visible-mat  visible-mat)
    (update-css! root :--hidden-mat hidden-mat)
    (update-css! root :--text-mat "var(--hidden-mt)")
    (update-css! root :--text-op 0)))

(defn begin-transition-styles! []
  (let [root (.querySelector js/document ":root")]
    (update-css! root :--hidden-mat visible-mat)
    (update-css! root :--visible-mat hidden-mat)))

(defn end-transition-styles! []
  (let [root (.querySelector js/document ":root")]
    (update-css! root :--visible-mat (mat-to-string visible-mat))
    (update-css! root :--hidden-mat (mat-to-string hidden-mat))))

(defn delay-transition! [current-page route-params]
  (begin-transition-styles!)
  (sleep (fn []
           (transition! current-page route-params)
           (end-transition-styles!)) 1500))

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
  (init-css-variables!)
  (mount-root))

(defn ^:dev/after-load reload! []
  (mount-root))
