package com.costtracker.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Forwards all non-API, non-static routes to index.html so that
 * React Router can handle client-side routing.
 */
@Controller
public class SpaController {

    @RequestMapping(value = {
        "/",
        "/{path:^(?!api|uploads|assets|favicon\\.ico).*$}",
        "/{path:^(?!api|uploads|assets|favicon\\.ico).*$}/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
