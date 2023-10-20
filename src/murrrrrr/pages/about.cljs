(ns murrrrrr.pages.about
  (:require
   [murrrrrr.components.layout :refer [layout]]
   [murrrrrr.components.animated-text :refer [observed-letters]]))

(defn spiel []
  [:div.spiel
   [observed-letters "Hello this is the about page"]])

(defn about-page []
  [layout
   [spiel]])
