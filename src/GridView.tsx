import React from "react";
import "./GridView.css";

interface Profile {
  uid?: string;
  id?: string | number;
  displayName?: string;
  name?: string;
  age?: number;
  distance?: string;
  activity?: string;
}

interface GridViewProps {
  profiles: Profile[];
}

const GridView: React.FC<GridViewProps> = ({ profiles }) => {
  return (
    <div className="parent-container">
      <div className="grid-container">
        {profiles.map((profile) => (
          <div className="grid-item" key={profile.uid || profile.id}>
            <div>{profile.displayName || profile.name}, {profile.age}</div>
            <div>{profile.distance}</div>
            <div>{profile.activity}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GridView; 