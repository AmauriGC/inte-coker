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
 * (ADMIN_EMAIL / ADMIN_PASSWORD del .env) y, si SEMILLA_CATALOGO=true, agrega los
 * muebles de ejemplo que falten. La lógica vive en los services.
 */
@Component
public class DatosIniciales implements ApplicationRunner {

    private final RolService rolService;
    private final UsuarioService usuarioService;
    private final SemillaCatalogoService semillaCatalogoService;
    private final String adminEmail;
    private final String adminPassword;
    private final boolean semillaCatalogo;

    public DatosIniciales(RolService rolService,
                          UsuarioService usuarioService,
                          SemillaCatalogoService semillaCatalogoService,
                          @Value("${app.admin.email}") String adminEmail,
                          @Value("${app.admin.password}") String adminPassword,
                          @Value("${app.semilla.catalogo:true}") boolean semillaCatalogo) {
        this.rolService = rolService;
        this.usuarioService = usuarioService;
        this.semillaCatalogoService = semillaCatalogoService;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.semillaCatalogo = semillaCatalogo;
    }

    @Override
    public void run(ApplicationArguments args) {
        rolService.asegurarRolesYPermisos();
        usuarioService.asegurarAdmin(adminEmail, adminPassword);
        if (semillaCatalogo) {
            semillaCatalogoService.sembrarFaltantes(adminEmail);
        }
    }
}
