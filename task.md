# Phase 10: My Requests Tab, Broker Score & Dark/Light Mode

- [ ] **State Management**
    - [ ] Add `resolvedCounts` score map to `AppContext.jsx`.
    - [ ] Update `resolveCustomRequest` to accept a `resolvedByBrokerId` param and increment score.
    - [ ] Allow Renter to mark their own request as resolved (passes null brokerId).
- [ ] **Renter Dashboard**
    - [ ] Add "My Requests" tab in `RenterDashboard.jsx` that shows submitted requests and allows resolution.
- [ ] **Broker Dashboard**
    - [ ] Display `resolvedCounts` for the current broker as a score badge.
- [ ] **Dark/Light Mode**
    - [ ] Add `theme` state + `toggleTheme` to `AuthContext` or a new `ThemeContext`.
    - [ ] Add CSS light-mode overrides in `App.css` / `index.css`.
    - [ ] Add Toggle button in `Navbar.jsx`.
