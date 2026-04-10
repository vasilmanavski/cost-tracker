package com.costtracker.controller;

import com.costtracker.dto.DashboardSummaryResponse;
import com.costtracker.security.AuthUtil;
import com.costtracker.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.YearMonth;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse getSummary(
            @RequestParam(required = false) String month
    ) {
        YearMonth ym = (month != null) ? YearMonth.parse(month) : YearMonth.now();
        return dashboardService.getSummary(AuthUtil.getCurrentUserId(), ym);
    }
}
