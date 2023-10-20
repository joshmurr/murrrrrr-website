(ns murrrrrr.pages.home
  (:require
   [murrrrrr.components.layout :refer [layout]]
   [murrrrrr.components.animated-text :refer [observed-letters]]))

(defn spiel []
  [:div.spiel
   ; [ani-letters "Hello, I'm a web developer."]
   [observed-letters "Hello, I'm a web developer."]])

(defn home-page []
  [layout
   ; [background-container]
   [:div {:style {:height "20vh"}}]
   [spiel]])
