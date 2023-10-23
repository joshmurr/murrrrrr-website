(ns murrrrrr.routes
  (:require [reitit.frontend :as reitit]
            [murrrrrr.pages.home :refer [home-page]]
            [murrrrrr.pages.about :refer [about-page]]))

;; -------------------------
;; Routes

(def router
  (reitit/router
   [["/" :index]
    ["/about" :about]]))

(defn path-for [route & [params]]
  (:path (reitit/match-by-name router route params))
  (:path (reitit/match-by-name router route)))

;; -------------------------
;; Translate routes -> page components

(defn page-for [route]
  (case route
    :index #'home-page
    :about #'about-page))

