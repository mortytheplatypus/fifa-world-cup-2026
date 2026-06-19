import { Outlet } from 'react-router-dom';

function GroupsLayout() {
  return (
    <section className="page groups-page">
      <Outlet />
    </section>
  );
}

export default GroupsLayout;
