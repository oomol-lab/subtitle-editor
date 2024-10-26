import type { ReactNode } from "react";
import {
  NodeIndexOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import { Menu } from "antd";

import React, { useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { RoutePath } from "../constants";

import styles from "./SideNav.module.scss";

export const SideNav = () => {
  const items = useMemo(() => {
    const items: Array<{
      label: ReactNode;
      key: string;
      icon: ReactNode;
    }> = [
      {
        label: "Home",
        key: RoutePath.projects,
        icon: <NodeIndexOutlined />,
      },
      {
        label: "settings",
        key: RoutePath.Settings,
        icon: <SettingOutlined />,
      },
    ];

    for (const item of items) {
      item.label = <Link to={item.key}>{item.label}</Link>;
    }

    return items;
  }, []);

  const location = useLocation();

  const selectedKeys = useMemo(() => {
    const pathname = `/${location.pathname.split("/").slice(1, 3).join("/")}`;
    return items.some(item => item.key === pathname) ? [pathname] : [];
  }, [items, location.pathname]);

  const navigate = useNavigate();

  const onSelect = useCallback(
    (item: { key: string }) => navigate(item.key),
    [navigate],
  );

  return (
    <Menu
      className={styles.menu}
      items={items}
      selectedKeys={selectedKeys}
      onSelect={onSelect}
    />
  );
};
