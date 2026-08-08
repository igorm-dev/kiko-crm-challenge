import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/layouts/AppSidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export function AppLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset className="min-w-0">
                <SidebarTrigger className="m-2 md:hidden" />
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    );
}
