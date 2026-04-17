import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SiteLayout from "./components/SiteLayout";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import ComparePage from "./pages/ComparePage";
import ComparePostPage from "./pages/ComparePostPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import ToolPage from "./pages/ToolPage";
import ToolsPage from "./pages/ToolsPage";
import "./styles/app.css";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/:slug" element={<ToolPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/compare/:slug" element={<ComparePostPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/newsletter" element={<Navigate to="/blog" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
