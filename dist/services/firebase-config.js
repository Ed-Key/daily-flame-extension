"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var app_1 = require("firebase/app");
var firestore_1 = require("firebase/firestore");
// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyANFOOgSGPLhyzri5jaPOYmAv-CeGIv4zs",
    authDomain: "daily-flame.firebaseapp.com",
    projectId: "daily-flame",
    storageBucket: "daily-flame.firebasestorage.app",
    messagingSenderId: "129859451154",
    appId: "1:129859451154:web:583759894f1ce471b35bcb"
};
// Initialize Firebase
var app = (0, app_1.initializeApp)(firebaseConfig);
// Initialize Firestore
exports.db = (0, firestore_1.getFirestore)(app);
exports.default = app;
