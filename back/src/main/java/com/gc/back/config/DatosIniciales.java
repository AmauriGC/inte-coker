package com.gc.back.config;

import com.gc.back.mueble.service.SemillaCatalogoService;
import com.gc.back.rol.service.RolService;
import com.gc.back.usuario.service.UsuarioService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Al arrancar asegura los roles, los permisos y el administrador inicial
 * (ADMIN_EMAIL / ADMIN_PASSWORD del .env) y, si SEMILLA_CATALOGO=true, el vendedor de
 * ejemplo (VENDEDOR_DEMO_EMAIL / VENDEDOR_DEMO_PASSWORD) con los muebles de ejemplo que falten.
 * La lógica vive en los services.
 */
@Component
public class DatosIniciales implements ApplicationRunner {

    private final RolService rolService;
    private final UsuarioService usuarioService;
    private final SemillaCatalogoService semillaCatalogoService;
    private final String adminEmail;
    private final String adminPassword;
    private final boolean semillaCatalogo;
    private final String vendedorDemoEmail;
    private final String vendedorDemoPassword;

    public DatosIniciales(RolService rolService,
                          UsuarioService usuarioService,
                          SemillaCatalogoService semillaCatalogoService,
                          @Value("${app.admin.email}") String adminEmail,
                          @Value("${app.admin.password}") String adminPassword,
                          @Value("${app.semilla.catalogo:true}") boolean semillaCatalogo,
                          @Value("${app.vendedor-demo.email}") String vendedorDemoEmail,
                          @Value("${app.vendedor-demo.password}") String vendedorDemoPassword) {
        this.rolService = rolService;
        this.usuarioService = usuarioService;
        this.semillaCatalogoService = semillaCatalogoService;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.semillaCatalogo = semillaCatalogo;
        this.vendedorDemoEmail = vendedorDemoEmail;
        this.vendedorDemoPassword = vendedorDemoPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        rolService.asegurarRolesYPermisos();
        usuarioService.asegurarAdmin(adminEmail, adminPassword);
        usuarioService.asegurarSlugs();
        if (semillaCatalogo) {
            semillaCatalogoService.sembrarFaltantes(
                    usuarioService.asegurarVendedorDemo(vendedorDemoEmail, vendedorDemoPassword));
        }
    }
}
