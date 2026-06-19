import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

function GroupsPageToolbar({ children }) {
  return (
    <div className="groups-page-toolbar">
      <nav className="group-fixtures-tabs" aria-label="Groups sections">
        <NavLink to="/groups" end className="group-fixtures-tab">
          Groups
        </NavLink>
        <NavLink to="/groups/tables" className="group-fixtures-tab">
          Point tables
        </NavLink>
      </nav>

      <div className="fixtures-controls groups-page-toolbar-filters">{children}</div>
    </div>
  );
}

GroupsPageToolbar.propTypes = {
  children: PropTypes.node,
};

export default GroupsPageToolbar;
