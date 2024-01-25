(ns murrrrrr.state
  (:require [reagent.core :as r]))

(def state (r/atom {:obstacles [{:top "50%"
                                 :left "10%"
                                 :width "auto"
                                 :height "auto"
                                 :border true}
                                {:top "80%"
                                 :left "30%"
                                 :width "300px"
                                 :height "50px"
                                 :border true}]}))
