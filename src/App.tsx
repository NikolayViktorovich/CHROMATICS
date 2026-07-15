import { Routes, Route } from 'react-router-dom'
import { StoreLayout } from './components/StoreLayout'
import { HomePage } from './pages/HomePage'
import { CatalogPage } from './pages/CatalogPage'
import { ProductPage } from './pages/ProductPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import { PublicOfferPage } from './pages/PublicOfferPage'
import { AdminLayout } from './admin/AdminLayout'
import { LoginPage } from './admin/LoginPage'
import { ProductsAdminPage } from './admin/ProductsAdminPage'
import { ProductFormPage } from './admin/ProductFormPage'
import { CategoriesAdminPage } from './admin/CategoriesAdminPage'
import { ChangePasswordPage } from './admin/ChangePasswordPage'

export default function App() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route index element={<HomePage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="catalog/:categorySlug" element={<CatalogPage />} />
        <Route path="product/:slug" element={<ProductPage />} />
        <Route path="privacy" element={<PrivacyPolicyPage />} />
        <Route path="offer" element={<PublicOfferPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<ProductsAdminPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id" element={<ProductFormPage />} />
        <Route path="categories" element={<CategoriesAdminPage />} />
        <Route path="password" element={<ChangePasswordPage />} />
      </Route>
    </Routes>
  )
}
