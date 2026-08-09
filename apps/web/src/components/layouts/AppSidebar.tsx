import { NavLink } from 'react-router-dom';
import { Briefcase, LogOut, SquareKanban, Users, UserSquare } from 'lucide-react';
import { KikosLogo } from '@/components/KikosLogo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/routes/paths';

const NAV_ITEMS = [
    { to: ROUTES.board, label: 'Board', icon: SquareKanban },
    { to: ROUTES.leads, label: 'Leads', icon: Users },
    { to: ROUTES.deals, label: 'Negócios', icon: Briefcase },
    { to: ROUTES.sellers, label: 'Vendedores', icon: UserSquare },
];

export function AppSidebar() {
    const { user, signOut } = useAuth();

    return (
        <Sidebar collapsible="offcanvas">
            <SidebarHeader className="px-5 py-6">
                <KikosLogo className="text-2xl" />
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                                <SidebarMenuItem key={to}>
                                    <NavLink to={to}>
                                        {({ isActive }) => (
                                            <SidebarMenuButton
                                                isActive={isActive}
                                                size="lg"
                                                tooltip={label}
                                                className="gap-3 border border-transparent data-[active=true]:border-primary/40 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                                            >
                                                <Icon className="size-5" />
                                                <span className="font-medium">{label}</span>
                                            </SidebarMenuButton>
                                        )}
                                    </NavLink>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="gap-3 border-t border-sidebar-border p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="size-9 bg-primary">
                        <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                            {initialsOf(user?.name)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{user?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user?.jobTitle}</p>
                    </div>
                </div>

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={signOut}
                            className="gap-3 text-muted-foreground"
                        >
                            <LogOut className="size-4" />
                            <span>Sair</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

function initialsOf(name: string | undefined): string {
    if (!name) {
        return '';
    }

    const parts = name.trim().split(/\s+/);
    const first = parts.at(0)?.charAt(0) ?? '';
    const last = parts.length > 1 ? (parts.at(-1)?.charAt(0) ?? '') : '';

    return (first + last).toUpperCase();
}
