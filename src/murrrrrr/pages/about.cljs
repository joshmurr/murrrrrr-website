(ns murrrrrr.pages.about
  (:require
   [murrrrrr.components.layout :refer [layout]]
   [murrrrrr.components.animated-text :refer [ani-letters]]))

(defn spiel []
  [:div.spiel
   [ani-letters "Hello this is the about page"]])

(defn about-page []
  [layout
   [spiel]])
