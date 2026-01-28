import { Route, Switch } from "wouter";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Organization from "./pages/Organization";
import Resources from "./pages/Resources";
import Projects from "./pages/Projects";
import Allocations from "./pages/Allocations";
import Scenarios from "./pages/Scenarios";
import Capacity from "./pages/Capacity";

export default function App() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/organization" component={Organization} />
          <Route path="/resources" component={Resources} />
          <Route path="/projects" component={Projects} />
          <Route path="/allocations" component={Allocations} />
          <Route path="/scenarios" component={Scenarios} />
          <Route path="/capacity" component={Capacity} />
          <Route>
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Page not found</p>
            </div>
          </Route>
        </Switch>
      </main>
    </div>
  );
}
