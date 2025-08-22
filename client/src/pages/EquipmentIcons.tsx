import React from "react";

interface Equipment {
  label: string;
  icon: string;
}

const equipmentList: Equipment[] = [
  { label: "Jantes aluminium", icon: "/src/assets/icons/jantes.png" },
  { label: "ABS", icon: "/src/assets/icons/abs.png" },
  { label: "Climatisation", icon: "/src/assets/icons/clim.png" },
  { label: "ESP", icon: "/src/assets/icons/esp.png" },
  { label: "Airbags", icon: "/src/assets/icons/airbag.png" },
  { label: "Bluetooth", icon: "/src/assets/icons/bluetooth.png" },
  { label: "Radar de recul", icon: "/src/assets/icons/radar.png" },
  { label: "Antipatinage", icon: "/src/assets/icons/traction.png" },
  { label: "Limiteur de vitesse", icon: "/src/assets/icons/limiteur.png" },
  { label: "Régulateur de vitesse", icon: "/src/assets/icons/regulateur.png" },
];

export const EquipmentIcons: React.FC = () => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-4">
      <h4 className="text-md font-bold text-black mb-3">Équipements</h4>
      <div className="grid grid-cols-3 gap-4 text-sm text-gray-700">
        {equipmentList.map((eq, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center border rounded-lg p-3"
          >
            <img src={eq.icon} alt={eq.label} className="w-8 h-8 mb-2" />
            <span className="text-center">{eq.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
